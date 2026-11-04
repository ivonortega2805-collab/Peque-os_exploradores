let estadoUsuario = {
    estrellas: 0,
    nivel: 1,
    nombre: "Explorador",
    edad: "--",
    grado: "Sin Grado",
    genero: "",
    codigo_qr: "EXPLORADOR-0000000000",
    nino_id: null
};

let juegoMate = { n1: 0, n2: 0, op: '+', resp: 0 };

const materiasData = {
    espanol: {
        titulo: "Español y Comprensión Lectora",
        desc: "Aprende ortografía, gramática, sujeto y predicado, y reglas de acentuación con ejercicios prácticos.",
        icono: "fa-book"
    },
    ciencias: {
        titulo: "Ciencias Naturales y Biología",
        desc: "Explora la fotosíntesis, el ciclo del agua, el cuerpo humano y la preservación de los ecosistemas.",
        icono: "fa-flask"
    },
    geografia: {
        titulo: "Geografía y el Planeta Tierra",
        desc: "Descubre los continentes, océanos, orografía, climas del mundo y representación de mapas.",
        icono: "fa-earth-americas"
    },
    historia: {
        titulo: "Historia Universal y Nacional",
        desc: "Viaja a través del tiempo conociendo las civilizaciones antiguas y grandes hitos históricos.",
        icono: "fa-landmark"
    },
    civica: {
        titulo: "Formación Cívica y Ética",
        desc: "Comprende los derechos de la infancia, las reglas comunitarias y la vida en armonía.",
        icono: "fa-scale-balanced"
    }
};

const lecturasLargas = [
    {
        id: 1,
        titulo: "El Viaje del Pequeño Colibrí y el Secreto del Bosque",
        texto: "Había una vez en un frondoso bosque un pequeño colibrí llamado Tito. Tito era famoso porque sus alas brillaban con hermosos tonos esmeralda. Un verano caluroso, el arroyo principal del bosque comenzó a secarse rápidamente. Los animales estaban muy preocupados. Tito no se rindió y voló hacia la cima de la montaña más alta para pedir ayuda a las nubes. Con amabilidad, respeto y perseverancia, les explicó la situación. Las nubes, conmocionadas por la dedicación de Tito, volaron hacia el valle y dejaron caer una suave lluvia fresca que llenó de nuevo el arroyo, salvando a todo el bosque.",
    }
];

const valoresLista = [
    { titulo: "La Empatía", desc: "Comprender y sentir lo que otra persona experimenta.", tip: "Ponte en el lugar del otro antes de opinar." },
    { titulo: "El Respeto", desc: "Tratar con amabilidad y valorar las diferencias individuales.", tip: "Escucha a los demás cuando expresen sus ideas." },
    { titulo: "La Honestidad", desc: "Decir la verdad y actuar con sinceridad siempre.", tip: "Admite tus errores con valor y rectifica." },
    { titulo: "La Responsabilidad", desc: "Cumplir tus compromisos y tareas con esmero.", tip: "Termina tus deberes escolares antes de ir a jugar." }
];

document.addEventListener("DOMContentLoaded", () => {
    cargarMateria('espanol');
    renderizarValores();
    renderizarLecturas();
    renderizarRecompensas();
});

function mostrarPantalla(id) {
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.bottom-nav .nav-item').forEach(n => n.classList.remove('active'));
    
    document.getElementById(`sec-${id}`).classList.add('active');
    
    const btnNav = document.getElementById(`btn-nav-${id}`);
    if (btnNav) btnNav.classList.add('active');

    if (id === 'perfil-nino') {
        actualizarVistaPerfilNino();
    }
}

function cargarMateria(clave) {
    const data = materiasData[clave];
    const box = document.getElementById('materia-contenido-box');
    box.innerHTML = `
        <div class="subject-card">
            <h3><i class="fa-solid ${data.icono}"></i> ${data.titulo}</h3>
            <p>${data.desc}</p>
            <button class="btn-primary" style="margin-top: 15px;" onclick="sumarEstrellas(2)">Completar Módulo (+2 ⭐)</button>
        </div>
    `;
}

function renderizarValores() {
    const grid = document.getElementById('grid-valores-tarjetas');
    if (grid) {
        grid.innerHTML = valoresLista.map(v => `
            <div class="value-card">
                <h3>${v.titulo}</h3>
                <p>${v.desc}</p>
                <small style="color: var(--primary);"><strong>Consejo:</strong> ${v.tip}</small>
            </div>
        `).join('');
    }
}

function renderizarLecturas() {
    const grid = document.getElementById('grid-lecturas');
    if (grid) {
        grid.innerHTML = lecturasLargas.map(l => `
            <div class="article-card">
                <h3>${l.titulo}</h3>
                <p style="line-height:1.6; margin: 10px 0;">${l.texto}</p>
                <button class="btn-primary" onclick="sumarEstrellas(5)">¡Lectura Completada! (+5 ⭐)</button>
            </div>
        `).join('');
    }
}

function sumarEstrellas(cant) {
    estadoUsuario.estrellas = Math.max(0, estadoUsuario.estrellas + cant);
    estadoUsuario.nivel = Math.floor(estadoUsuario.estrellas / 20) + 1;
    document.getElementById('contador-estrellas').textContent = estadoUsuario.estrellas;
    document.getElementById('nivel-usuario').textContent = `Nivel ${estadoUsuario.nivel}`;
    
    fetch('/api/nino/actualizar-estrellas', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ estrellas: cant })
    }).catch(() => {});

    if(cant > 0) alert(`¡Has ganado ${cant} estrellas! ⭐`);
}

function completarHabito(btn, cant) {
    btn.disabled = true;
    btn.innerText = "¡Completado! ✓";
    sumarEstrellas(cant);
}

function renderizarRecompensas() {
    const grid = document.getElementById('grid-recompensas');
    if (grid) {
        grid.innerHTML = `
            <div class="reward-card">
                <h3>Insignia Explorador Junior</h3>
                <p>Requiere 10 Estrellas</p>
                <button class="btn-primary" onclick="canjearPremios(10)">Canjear</button>
            </div>
            <div class="reward-card">
                <h3>Trofeo Sabio Escolar</h3>
                <p>Requiere 30 Estrellas</p>
                <button class="btn-primary" onclick="canjearPremios(30)">Canjear</button>
            </div>
        `;
    }
}

function canjearPremios(costo) {
    if (estadoUsuario.estrellas >= costo) {
        sumarEstrellas(-costo);
        alert("¡Felicidades! Has canjeado tu recompensa virtual 🎉");
    } else {
        alert("¡Te faltan estrellas! Sigue completando actividades.");
    }
}

// ---------------- RETOS MATEMÁTICOS ----------------

function iniciarJuegoMate(modo) {
    document.getElementById('arena-mate').classList.remove('hidden');
    juegoMate.n1 = Math.floor(Math.random() * 10) + 1;
    juegoMate.n2 = Math.floor(Math.random() * 10) + 1;

    if (modo === 'suma') { juegoMate.op = '+'; juegoMate.resp = juegoMate.n1 + juegoMate.n2; }
    else if (modo === 'resta') { 
        if(juegoMate.n1 < juegoMate.n2) [juegoMate.n1, juegoMate.n2] = [juegoMate.n2, juegoMate.n1];
        juegoMate.op = '-'; juegoMate.resp = juegoMate.n1 - juegoMate.n2; 
    }
    else if (modo === 'multiplicacion') { juegoMate.op = '×'; juegoMate.resp = juegoMate.n1 * juegoMate.n2; }
    else if (modo === 'division') { juegoMate.resp = juegoMate.n1; juegoMate.n1 = juegoMate.n1 * juegoMate.n2; juegoMate.op = '÷'; }
    else { juegoMate.op = '+'; juegoMate.resp = juegoMate.n1 + juegoMate.n2; }

    document.getElementById('pregunta-mate-txt').textContent = `${juegoMate.n1} ${juegoMate.op} ${juegoMate.n2} = ?`;
    document.getElementById('resp-mate-input').value = '';
    document.getElementById('feedback-mate').textContent = '';
}

function verificarRespuestaMate() {
    const val = parseInt(document.getElementById('resp-mate-input').value);
    const feedback = document.getElementById('feedback-mate');
    if (val === juegoMate.resp) {
        feedback.style.color = 'var(--success)';
        feedback.textContent = '¡Correcto! +2 estrellas ⭐';
        sumarEstrellas(2);
        setTimeout(() => iniciarJuegoMate('suma'), 1500);
    } else {
        feedback.style.color = 'var(--accent)';
        feedback.textContent = 'Inténtalo de nuevo.';
    }
}

// ---------------- AUTENTICACIÓN Y ABCM ----------------

function abrirModalAuth() { document.getElementById('modal-auth').classList.add('active'); }
function cerrarModalAuth() { document.getElementById('modal-auth').classList.remove('active'); }

function verTabAuth(tab) {
    document.getElementById('form-login-tutor').classList.add('hidden');
    document.getElementById('form-reg-tutor').classList.add('hidden');
    document.getElementById('box-login-qr').classList.add('hidden');

    if(tab === 'login') document.getElementById('form-login-tutor').classList.remove('hidden');
    if(tab === 'registro') document.getElementById('form-reg-tutor').classList.remove('hidden');
    if(tab === 'qr') document.getElementById('box-login-qr').classList.remove('hidden');
}

async function loginTutor(e) {
    e.preventDefault();
    try {
        const res = await fetch('/api/tutor/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                email: document.getElementById('login-email').value,
                password: document.getElementById('login-pwd').value
            })
        });
        const data = await res.json();
        if(res.ok && data.success) {
            document.getElementById('auth-seccion-tutor').classList.add('hidden');
            document.getElementById('panel-abcm-tutor').classList.remove('hidden');
            cargarListaNinosABCM();
        } else {
            alert(data.msg || "Credenciales incorrectas.");
        }
    } catch (err) {
        alert("Error de conexión con el servidor.");
    }
}

async function registroTutor(e) {
    e.preventDefault();
    const res = await fetch('/api/tutor/registro', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            nombre: document.getElementById('reg-nombre').value,
            email: document.getElementById('reg-email').value,
            password: document.getElementById('reg-pwd').value,
            telefono: document.getElementById('reg-tel').value
        })
    });
    const data = await res.json();
    if(data.success) {
        alert("Registro exitoso. Inicia sesión.");
        verTabAuth('login');
    } else {
        alert(data.msg);
    }
}

async function cargarListaNinosABCM() {
    const res = await fetch('/api/ninos');
    const data = await res.json();
    const box = document.getElementById('lista-ninos-abcm');
    if(data.success) {
        box.innerHTML = data.ninos.map(n => `
            <div class="abcm-item" style="background:#f8f9fa; padding:12px; border-radius:10px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <strong>${n.nombre}</strong> (${n.edad} años, ${n.grado_escolar})<br>
                    <small>QR: ${n.codigo_qr} | Estrellas: ${n.estrellas}</small>
                </div>
                <div>
                    <button class="btn-primary" onclick="seleccionarNinoSesion(${n.id})">Entrar</button>
                    <button class="btn-secondary" onclick="bajaNino(${n.id})">Baja</button>
                </div>
            </div>
        `).join('');
    }
}

async function altaNino(e) {
    e.preventDefault();
    const res = await fetch('/api/ninos/alta', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            nombre: document.getElementById('alta-nombre').value,
            edad: document.getElementById('alta-edad').value,
            grado: document.getElementById('alta-grado').value,
            genero: document.getElementById('alta-genero').value
        })
    });
    const data = await res.json();
    if(data.success) {
        document.getElementById('alta-nombre').value = '';
        document.getElementById('alta-edad').value = '';
        document.getElementById('alta-grado').value = '';
        cargarListaNinosABCM();
    }
}

async function bajaNino(id) {
    if(confirm("¿Seguro que deseas eliminar este perfil?")) {
        await fetch(`/api/ninos/baja/${id}`, { method: 'DELETE' });
        cargarListaNinosABCM();
    }
}

async function seleccionarNinoSesion(id) {
    try {
        const res = await fetch(`/api/nino/seleccionar/${id}`, { method: 'POST' });
        const data = await res.json();
        
        if (data.success) {
            estadoUsuario.nino_id = data.nino.id;
            estadoUsuario.nombre = data.nino.nombre;
            estadoUsuario.edad = data.nino.edad;
            estadoUsuario.grado = data.nino.grado_escolar;
            estadoUsuario.genero = data.nino.genero;
            estadoUsuario.codigo_qr = data.nino.codigo_qr;
            estadoUsuario.estrellas = data.nino.estrellas;
            estadoUsuario.nivel = data.nino.nivel;

            document.getElementById('nombre-nino-activo').textContent = data.nino.nombre;
            document.getElementById('contador-estrellas').textContent = data.nino.estrellas;
            document.getElementById('nivel-usuario').textContent = `Nivel ${data.nino.nivel}`;
            
            cerrarModalAuth();
            mostrarPantalla('inicio');
            alert(`¡Sesión iniciada como ${data.nino.nombre}! 🎉`);
        } else {
            alert(data.msg || "No se pudo iniciar sesión.");
        }
    } catch (err) {
        alert("Error de conexión al seleccionar el perfil.");
    }
}

async function loginNinoQR() {
    const code = document.getElementById('qr-code-input').value;
    const res = await fetch('/api/nino/login-qr', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ codigo_qr: code })
    });
    const data = await res.json();
    if(data.success) {
        seleccionarNinoSesion(data.nino.id);
    } else {
        alert(data.msg || "Código QR no encontrado.");
    }
}

async function actualizarVistaPerfilNino() {
    document.getElementById('pnino-nombre').textContent = estadoUsuario.nombre;
    document.getElementById('pnino-grado').textContent = estadoUsuario.grado;
    document.getElementById('pnino-edad').textContent = estadoUsuario.edad + " años";
    document.getElementById('pnino-estrellas').textContent = estadoUsuario.estrellas;
    document.getElementById('pnino-nivel').textContent = estadoUsuario.nivel;
    document.getElementById('pnino-qr-code').textContent = estadoUsuario.codigo_qr;

    if (estadoUsuario.codigo_qr && estadoUsuario.codigo_qr !== "EXPLORADOR-0000000000") {
        try {
            const res = await fetch(`/api/nino/generar-qr-imagen/${estadoUsuario.codigo_qr}`);
            const data = await res.json();
            if (data.success) {
                document.getElementById('pnino-qr-img-box').innerHTML = `<img src="${data.qr_image}" alt="Código QR" style="max-width:140px; border-radius:8px;">`;
            }
        } catch (err) {
            console.error("Error al obtener imagen QR");
        }
    }
}

function cerrarSesionTutor() {
    fetch('/api/logout', { method: 'POST' });
    location.reload();
}