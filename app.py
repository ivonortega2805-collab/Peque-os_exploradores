from flask import Flask, render_template, request, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash
import pymysql
import qrcode
import io
import base64
import uuid

app = Flask(__name__)
app.secret_key = 'pequenos_exploradores_secret_key_super_segura'

# CONFIGURACIÓN DE CONEXIÓN A MYSQL
MYSQL_HOST = 'localhost'
MYSQL_USER = 'root'
MYSQL_PASSWORD = 'ivon1234'  # Si tu MySQL tiene contraseña, ponla aquí
MYSQL_DB = 'pequenos_exploradores'

def get_db():
    return pymysql.connect(
        host=MYSQL_HOST,
        user=MYSQL_USER,
        password=MYSQL_PASSWORD,
        database=MYSQL_DB,
        cursorclass=pymysql.cursors.DictCursor
    )

# ----------------- RUTAS DE VISTA Y AUTENTICACIÓN TUTOR -----------------

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/tutor/registro', methods=['POST'])
def registrar_tutor():
    data = request.json
    nombre = data.get('nombre')
    email = data.get('email')
    password = data.get('password')
    telefono = data.get('telefono', '')

    if not nombre or not email or not password:
        return jsonify({'success': False, 'msg': 'Todos los campos son requeridos.'}), 400

    conn = get_db()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT id FROM tutores WHERE email = %s", (email,))
            if cursor.fetchone():
                return jsonify({'success': False, 'msg': 'El correo ya está registrado.'}), 400

            pwd_hash = generate_password_hash(password)
            cursor.execute(
                "INSERT INTO tutores (nombre, email, password_hash, telefono) VALUES (%s, %s, %s, %s)",
                (nombre, email, pwd_hash, telefono)
            )
            conn.commit()
            return jsonify({'success': True, 'msg': 'Registro exitoso como tutor.'})
    finally:
        conn.close()

@app.route('/api/tutor/login', methods=['POST'])
def login_tutor():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    conn = get_db()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM tutores WHERE email = %s", (email,))
            tutor = cursor.fetchone()
            if tutor and check_password_hash(tutor['password_hash'], password):
                session['tutor_id'] = tutor['id']
                session['tutor_nombre'] = tutor['nombre']
                return jsonify({'success': True, 'tutor': {'id': tutor['id'], 'nombre': tutor['nombre']}})
            return jsonify({'success': False, 'msg': 'Credenciales incorrectas.'}), 401
    finally:
        conn.close()

@app.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'success': True})

# ----------------- ABCM DE NIÑOS (PRIVACIDAD GARANTIZADA) -----------------

@app.route('/api/ninos', methods=['GET'])
def listar_ninos():
    if 'tutor_id' not in session:
        return jsonify({'success': False, 'msg': 'No autorizado.'}), 403

    conn = get_db()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM ninos WHERE tutor_id = %s", (session['tutor_id'],))
            ninos = cursor.fetchall()
            return jsonify({'success': True, 'ninos': ninos})
    finally:
        conn.close()

@app.route('/api/ninos/alta', methods=['POST'])
def alta_nino():
    if 'tutor_id' not in session:
        return jsonify({'success': False, 'msg': 'Acceso denegado.'}), 403

    data = request.json
    nombre = data.get('nombre')
    edad = data.get('edad')
    grado = data.get('grado')
    genero = data.get('genero')
    qr_token = f"EXPLORADOR-{uuid.uuid4().hex[:10].upper()}"

    conn = get_db()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                """INSERT INTO ninos (tutor_id, nombre, edad, grado_escolar, genero, codigo_qr) 
                   VALUES (%s, %s, %s, %s, %s, %s)""",
                (session['tutor_id'], nombre, edad, grado, genero, qr_token)
            )
            conn.commit()
            return jsonify({'success': True, 'msg': 'Niño registrado correctamente.'})
    finally:
        conn.close()

@app.route('/api/ninos/baja/<int:nino_id>', methods=['DELETE'])
def baja_nino(nino_id):
    if 'tutor_id' not in session:
        return jsonify({'success': False, 'msg': 'Acceso denegado.'}), 403

    conn = get_db()
    try:
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM ninos WHERE id = %s AND tutor_id = %s", (nino_id, session['tutor_id']))
            conn.commit()
            return jsonify({'success': True, 'msg': 'Registro eliminado correctamente.'})
    finally:
        conn.close()

# ----------------- SESIÓN Y PERFIL PRIVADO DEL NIÑO -----------------

@app.route('/api/nino/seleccionar/<int:nino_id>', methods=['POST'])
def seleccionar_nino(nino_id):
    if 'tutor_id' not in session:
        return jsonify({'success': False, 'msg': 'No autorizado.'}), 403
    
    conn = get_db()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM ninos WHERE id = %s AND tutor_id = %s", (nino_id, session['tutor_id']))
            nino = cursor.fetchone()
            if nino:
                session['nino_id'] = nino['id']
                session['nino_nombre'] = nino['nombre']
                return jsonify({'success': True, 'nino': nino})
            return jsonify({'success': False, 'msg': 'Perfil no encontrado.'}), 404
    finally:
        conn.close()

@app.route('/api/nino/login-qr', methods=['POST'])
def login_nino_qr():
    data = request.json
    qr_code = data.get('codigo_qr')

    conn = get_db()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM ninos WHERE codigo_qr = %s", (qr_code,))
            nino = cursor.fetchone()
            if nino:
                session['nino_id'] = nino['id']
                session['nino_nombre'] = nino['nombre']
                return jsonify({'success': True, 'nino': nino})
            return jsonify({'success': False, 'msg': 'Código QR no reconocido.'}), 404
    finally:
        conn.close()

@app.route('/api/nino/generar-qr-imagen/<string:codigo_qr>', methods=['GET'])
def generar_qr_imagen(codigo_qr):
    img = qrcode.make(codigo_qr)
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    byte_im = buf.getvalue()
    base64_src = f"data:image/png;base64,{base64.b64encode(byte_im).decode('utf-8')}"
    return jsonify({'success': True, 'qr_image': base64_src})

@app.route('/api/nino/actualizar-estrellas', methods=['POST'])
def actualizar_estrellas():
    if 'nino_id' not in session:
        return jsonify({'success': False, 'msg': 'No hay sesión de niño activa.'}), 403

    data = request.json
    estrellas_ganadas = data.get('estrellas', 0)

    conn = get_db()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT estrellas FROM ninos WHERE id = %s", (session['nino_id'],))
            nino = cursor.fetchone()
            nuevas_estrellas = max(0, nino['estrellas'] + estrellas_ganadas)
            nuevo_nivel = (nuevas_estrellas // 20) + 1

            cursor.execute("UPDATE ninos SET estrellas = %s, nivel = %s WHERE id = %s",
                           (nuevas_estrellas, nuevo_nivel, session['nino_id']))
            conn.commit()
            return jsonify({'success': True, 'estrellas': nuevas_estrellas, 'nivel': nuevo_nivel})
    finally:
        conn.close()

if __name__ == '__main__':
    print("Servidor corriendo en http://127.0.0.1:5000")
    app.run(debug=True, port=5000)