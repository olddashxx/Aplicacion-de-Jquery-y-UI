/* ==========================================================
   DEPORZONE WALLY PARK - LÓGICA DE INTERACCIÓN CON JQUERY
   Materia: Diseño Web II (Ingeniería de Sistemas)
   4 Funciones Clave:
     1. Menú Hamburguesa responsive permanente (.slideToggle)
     2. Modo Oscuro y Claro (.toggleClass, .fadeIn, .hide)
     3. Filtrado por Tipos y Subtipos (.fadeIn, .fadeOut, .show, .hide)
     4. Formulario de Reserva con cálculo en vivo, validación en tiempo real / blur y activación dinámica del botón
   ========================================================== */

$(document).ready(function() {

  // ==========================================================
  // SISTEMA DE BITÁCORA DE EVENTOS CON TIMESTAMP (DEPORZONE)
  // ==========================================================
  let historialEventos = JSON.parse(localStorage.getItem('deporzone_logs') || '[]');
  let contadorFiltros = parseInt(localStorage.getItem('deporzone_filters') || '0');
  let contadorReservas = parseInt(localStorage.getItem('deporzone_orders') || '0');

  function registrarEventoTimestamp(tipo, descripcion) {
    const ahoraLog = new Date();
    const fechaHora = ahoraLog.toLocaleString('es-BO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    historialEventos.unshift({
      timestamp: fechaHora,
      tipo: tipo,
      mensaje: descripcion
    });

    historialEventos = historialEventos.slice(0, 40);
    localStorage.setItem('deporzone_logs', JSON.stringify(historialEventos));

    renderizarBitacora();
  }

  function renderizarBitacora() {
    let $lista = $('#activity-log-list');
    $lista.empty();

    $('#stat-total-events').text(historialEventos.length);
    $('#stat-filter-events').text(contadorFiltros);
    $('#stat-order-events').text(contadorReservas);

    if (historialEventos.length === 0) {
      $lista.append('<div class="log-entry"><span class="log-message">Bitácora vacía. Interactúa con el catálogo de canchas o el formulario para registrar eventos con Timestamp.</span></div>');
      return;
    }

    historialEventos.forEach(function(item) {
      let filaHtml = `
        <div class="log-entry">
          <span class="log-timestamp"><i class="fa-regular fa-clock"></i> ${item.timestamp}</span>
          <span class="log-message">${item.mensaje}</span>
          <span class="log-type-tag">${item.tipo}</span>
        </div>
      `;
      $lista.append(filaHtml);
    });
  }

  // Botón Mostrar / Ocultar Bitácora con .fadeToggle()
  $('#toggle-log-btn').click(function() {
    $('#log-collapsible-box').fadeToggle(300);
    registrarEventoTimestamp('UI', 'Alternó visibilidad de la Bitácora con .fadeToggle()');
  });

  // Botón Limpiar Historial
  $('#clear-log-btn').click(function() {
    historialEventos = [];
    contadorFiltros = 0;
    contadorReservas = 0;
    localStorage.removeItem('deporzone_logs');
    localStorage.setItem('deporzone_filters', '0');
    localStorage.setItem('deporzone_orders', '0');
    renderizarBitacora();
    mostrarToastAlert('🧹 Bitácora Reiniciada', 'El historial de eventos con Timestamp fue limpiado correctamente.', false);
  });


  // ==========================================================
  // FUNCIÓN 1: MENÚ HAMBURGUESA PERMANENTE (DESPLEGABLE ELEGANTE)
  // ==========================================================
  // Al hacer clic en el botón de hamburguesa, despliega o recoge el menú
  $('#hamburger-btn').click(function(e) {
    e.stopPropagation(); // Evitar que el clic en el botón cierre el menú de inmediato
    $('#navbar').slideToggle(250);
    registrarEventoTimestamp('NAV', 'Desplegó / ocultó el menú hamburguesa (.slideToggle)');
  });

  // Al hacer clic en un enlace del menú, navega, se cierra suavemente y marca el activo
  $('.nav-link').click(function() {
    $('#navbar').slideUp(200);
    $('.nav-link').removeClass('active');
    $(this).addClass('active');
    registrarEventoTimestamp('NAV', `Navegó a la sección: ${$(this).text().trim()}`);
  });

  // Cerrar el menú si el usuario hace clic fuera de la cabecera
  $(document).click(function(e) {
    if (!$(e.target).closest('#main-header').length) {
      $('#navbar').slideUp(200);
    }
  });


  // ==========================================================
  // FUNCIÓN 2: MODO OSCURO Y CLARO (DARK / LIGHT MODE)
  // ==========================================================
  $('#theme-toggle-btn').click(function() {
    // Alterna la clase theme-dark en la etiqueta body
    $('body').toggleClass('theme-dark');

    // Alterna los iconos de Luna y Sol con animación jQuery
    if ($('body').hasClass('theme-dark')) {
      $('.icon-moon').hide();
      $('.icon-sun').show().fadeIn(200);
      $(this).attr('title', 'Cambiar a modo claro');
      registrarEventoTimestamp('TEMA', 'Activó el Modo Oscuro (.theme-dark)');
    } else {
      $('.icon-sun').hide();
      $('.icon-moon').show().fadeIn(200);
      $(this).attr('title', 'Cambiar a modo oscuro');
      registrarEventoTimestamp('TEMA', 'Activó el Modo Claro (.theme-light)');
    }
  });


  // ==========================================================
  // FUNCIÓN 3: FILTRADO DE CANCHAS POR TIPOS Y SUBTIPOS
  // ==========================================================
  let filtroTipoActual = 'all';
  let filtroSubtipoActual = 'all';

  // 3.1 Clic en botones de Tipo de Superficie
  $('.type-btn').click(function() {
    $('.type-btn').removeClass('active');
    $(this).addClass('active');

    filtroTipoActual = $(this).data('type');
    contadorFiltros++;
    localStorage.setItem('deporzone_filters', String(contadorFiltros));
    registrarEventoTimestamp('FILTRO', `Filtró superficie: ${$(this).text().trim()}`);
    aplicarFiltros();
  });

  // 3.2 Clic en botones de Subtipo de Ambiente
  $('.subtype-btn').click(function() {
    $('.subtype-btn').removeClass('active');
    $(this).addClass('active');

    filtroSubtipoActual = $(this).data('subtype');
    contadorFiltros++;
    localStorage.setItem('deporzone_filters', String(contadorFiltros));
    registrarEventoTimestamp('FILTRO', `Filtró ambiente: ${$(this).text().trim()}`);
    aplicarFiltros();
  });

  // 3.3 Función que evalúa ambas condiciones y anima las tarjetas
  function aplicarFiltros() {
    $('.court-card').each(function() {
      let cardTipo = $(this).data('type');
      let cardSubtipos = $(this).data('subtype') ? $(this).data('subtype').split(' ') : [];

      let coincideTipo = (filtroTipoActual === 'all') || (cardTipo === filtroTipoActual);
      let coincideSubtipo = (filtroSubtipoActual === 'all') || (cardSubtipos.includes(filtroSubtipoActual));

      if (coincideTipo && coincideSubtipo) {
        $(this).fadeIn(300);
      } else {
        $(this).fadeOut(300);
      }
    });
  }

  // 3.4 Botón "Seleccionar" en una tarjeta del catálogo
  $('.btn-select-court').click(function() {
    let courtId = $(this).data('court-id');
    let courtName = $(this).data('court-name');
    
    // Seleccionar automáticamente la cancha en el dropdown de la sección de reserva
    $('#select-cancha-reserva').val(courtId).trigger('change');
    registrarEventoTimestamp('CANCHA', `Seleccionó desde catálogo: ${courtName}`);

    // Desplazamiento suave hasta el formulario de reserva
    $('html, body').animate({
      scrollTop: $('#booking-section').offset().top - 80
    }, 500);
  });

  // 3.5 Pestaña Acordeón: Plegar y Desplegar Catálogo (Optimización de Espacio con .slideToggle)
  $('#toggle-catalog-btn').click(function() {
    let $btn = $(this);
    let $wrapper = $('#catalog-collapsible-wrapper');

    $wrapper.slideToggle(350, function() {
      if ($wrapper.is(':visible')) {
        $btn.removeClass('collapsed').attr('aria-expanded', 'true');
        $btn.find('.toggle-text').html('<i class="fa-solid fa-eye-slash"></i> Ocultar Catálogo de Canchas');
        registrarEventoTimestamp('UI', 'Desplegó el catálogo de canchas (.slideToggle)');
      } else {
        $btn.addClass('collapsed').attr('aria-expanded', 'false');
        $btn.find('.toggle-text').html('<i class="fa-solid fa-eye"></i> Ver / Mostrar Catálogo de Canchas');
        registrarEventoTimestamp('UI', 'Ocultó el catálogo de canchas (.slideToggle)');
      }
    });
  });


  // ==========================================================
  // FUNCIÓN 4: FORMULARIO DE RESERVA, VALIDACIONES Y CÁLCULO
  // ==========================================================
  
  // 4.1 Configurar fecha mínima permitida (HOY) para evitar fechas pasadas
  const ahora = new Date();
  const yyyy = ahora.getFullYear();
  const mm = String(ahora.getMonth() + 1).padStart(2, '0');
  const dd = String(ahora.getDate()).padStart(2, '0');
  const fechaHoyFormato = `${yyyy}-${mm}-${dd}`;

  // Establecer valor inicial y atributo min en HTML
  $('#fecha-reserva').attr('min', fechaHoyFormato).val(fechaHoyFormato);

  // Variables de control de horas y precios
  let precioPorHora = 80;
  let horaInicio = 19;
  let horaFin = 20;
  let horasValidas = true;

  // Lista de turnos ocupados fijos (para validar rangos continuos)
  const turnosOcupados = [
    { inicio: 16, fin: 17 },
    { inicio: 20, fin: 21 }
  ];

  // 4.2 Clic en los botones de Turnos Rápidos (.btn-slot)
  $('.btn-slot').click(function() {
    if ($(this).hasClass('ocupado')) {
      let hIni = $(this).data('inicio');
      let hF = $(this).data('fin');
      mostrarAlertaError(`⛔ El turno de las ${hIni}:00 a ${hF}:00 ya se encuentra reservado. Elige otro horario disponible.`);
      registrarEventoTimestamp('ALERTA', `Intentó seleccionar turno ocupado (${hIni}:00 a ${hF}:00)`);
      return;
    }

    // Remover estado activo de los demás y ponérselo al seleccionado
    $('.btn-slot:not(.ocupado)').removeClass('active-slot');
    $(this).addClass('active-slot');

    // Sincronizar con los selectores de hora inicio y fin
    horaInicio = parseInt($(this).data('inicio'));
    horaFin = parseInt($(this).data('fin'));

    $('#select-inicio').val(horaInicio);
    $('#select-fin').val(horaFin);

    registrarEventoTimestamp('TURNO', `Seleccionó turno rápido ${horaInicio}:00 a ${horaFin}:00`);
    validarHorarios();
    calcularTotalReserva();
    verificarFormularioCompleto();
  });

  // 4.3 Cambio en selectores de Hora Inicio y Fin
  $('#select-inicio, #select-fin').on('change blur', function() {
    horaInicio = parseInt($('#select-inicio').val());
    horaFin = parseInt($('#select-fin').val());

    validarHorarios();
    calcularTotalReserva();
    verificarFormularioCompleto();
  });

  // Función dedicada a validar los horarios
  function validarHorarios() {
    $('#select-inicio, #select-fin').removeClass('input-invalid input-valid');
    $('#err-hours').hide().text('');
    horasValidas = false;

    // Regla 1: Fin debe ser estrictamente mayor a inicio
    if (horaFin <= horaInicio) {
      $('#err-hours').text('⚠️ La hora de fin debe ser posterior a la de inicio (mínimo 1 hora de juego).').slideDown('fast');
      $('#select-inicio, #select-fin').addClass('input-invalid');
      $('.btn-slot').removeClass('active-slot');
      mostrarAlertaError('⚠️ Horario no válido: la hora fin debe ser mayor a la hora de inicio.');
      return false;
    }

    // Regla 2: Verificar si el rango abarca algún turno ocupado
    let tieneTurnoOcupado = false;
    let turnoChocado = '';
    for (let t of turnosOcupados) {
      // Si el intervalo seleccionado se superpone con un turno ocupado
      if (Math.max(horaInicio, t.inicio) < Math.min(horaFin, t.fin)) {
        tieneTurnoOcupado = true;
        turnoChocado = `${t.inicio}:00 a ${t.fin}:00`;
        break;
      }
    }

    if (tieneTurnoOcupado) {
      $('#err-hours').text(`⛔ Tu selección abarca el horario ${turnoChocado}, el cual ya está ocupado.`).slideDown('fast');
      $('#select-inicio, #select-fin').addClass('input-invalid');
      $('.btn-slot').removeClass('active-slot');
      mostrarAlertaError(`⛔ El rango seleccionado incluye turnos ocupados (${turnoChocado}). Elige horas libres.`);
      return false;
    }

    // Horario válido
    horasValidas = true;
    $('#select-inicio, #select-fin').addClass('input-valid');
    $('#err-hours').slideUp('fast');
    $('#booking-alert-error').slideUp('fast');

    // Sincronizar botón rápido si coincide exactamente con 1 turno
    $('.btn-slot').removeClass('active-slot');
    if (horaFin - horaInicio === 1) {
      $(`.btn-slot[data-inicio="${horaInicio}"][data-fin="${horaFin}"]:not(.ocupado)`).addClass('active-slot');
    }

    return true;
  }

  // 4.4 Cambio de Cancha Seleccionada
  $('#select-cancha-reserva').change(function() {
    let optSeleccionada = $(this).find('option:selected');
    precioPorHora = parseInt(optSeleccionada.data('precio')) || 80;

    let nombreCancha = optSeleccionada.text().split('(')[0].trim();
    $('#summary-court').text(nombreCancha);

    calcularTotalReserva();
  });

  // 4.5 Cambio en Adicionales
  $('input[name="add-ball"], input[name="add-vests"], input[name="add-water"]').change(function() {
    calcularTotalReserva();
  });

  // 4.6 Función central de cálculo y actualización en vivo del resumen
  function calcularTotalReserva() {
    let totalHoras = horaFin - horaInicio;

    if (!horasValidas || totalHoras <= 0) {
      $('#summary-hours').text('0 Horas (Horario inválido)');
      $('#summary-time').text('No asignado');
      $('#summary-total').text('0 BOB').css('color', '#e53935');
      return;
    }

    let subtotalCancha = totalHoras * precioPorHora;

    // Sumar adicionales seleccionados
    let totalAdicionales = 0;
    if ($('#add-ball').is(':checked')) totalAdicionales += parseInt($('#add-ball').val());
    if ($('#add-vests').is(':checked')) totalAdicionales += parseInt($('#add-vests').val());
    if ($('#add-water').is(':checked')) totalAdicionales += parseInt($('#add-water').val());

    let granTotal = subtotalCancha + totalAdicionales;

    // Actualizar texto del resumen
    $('#summary-hours').text(`${totalHoras} Hora(s)`);
    $('#summary-time').text(`${horaInicio}:00 a ${horaFin}:00`);

    // Animación jQuery para resaltar el cambio en el monto total (.animate)
    $('#summary-total')
      .text(`${granTotal} BOB`)
      .css('color', '#27ae60')
      .animate({ fontSize: '1.4rem' }, 120)
      .animate({ fontSize: '1.25rem' }, 120);
  }

  // 4.7 Función auxiliar para mostrar alertas de error con slideDown
  function mostrarAlertaError(mensaje) {
    $('#booking-alert-success').hide();
    $('#booking-alert-error').html(mensaje).slideDown('fast');
  }


  // ==========================================================
  // FUNCIONES DE VALIDACIÓN INDIVIDUAL (PARA BLUR / INPUT)
  // ==========================================================

  // Validación de Fecha (No vacía y no en el pasado)
  function validarCampoFecha() {
    let valorFecha = $('#fecha-reserva').val();
    $('#fecha-reserva').removeClass('input-invalid input-valid');
    $('#err-date').hide().text('');

    if (!valorFecha) {
      $('#err-date').text('⚠️ Debes seleccionar una fecha para la reserva.').slideDown('fast');
      $('#fecha-reserva').addClass('input-invalid');
      return false;
    }

    if (valorFecha < fechaHoyFormato) {
      $('#err-date').text('⚠️ No puedes reservar en una fecha pasada. Elige hoy o un día posterior.').slideDown('fast');
      $('#fecha-reserva').addClass('input-invalid');
      return false;
    }

    $('#fecha-reserva').addClass('input-valid');
    return true;
  }

  // Validación de Nombre Completo
  function validarCampoNombre() {
    let nombre = $('#client-name').val().trim();
    let regexNombre = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,50}$/;

    $('#client-name').removeClass('input-invalid input-valid');
    $('#err-name').hide().text('');

    if (nombre === '') {
      $('#err-name').text('⚠️ El nombre completo es obligatorio.').slideDown('fast');
      $('#client-name').addClass('input-invalid');
      return false;
    }

    if (!regexNombre.test(nombre)) {
      $('#err-name').text('⚠️ Ingresa un nombre válido (al menos 3 letras, sin números ni símbolos).').slideDown('fast');
      $('#client-name').addClass('input-invalid');
      return false;
    }

    $('#client-name').addClass('input-valid');
    return true;
  }

  // Validación de Celular / WhatsApp
  function validarCampoTelefono() {
    let tel = $('#client-phone').val().trim();
    let regexTel = /^[0-9]{7,10}$/;

    $('#client-phone').removeClass('input-invalid input-valid');
    $('#err-phone').hide().text('');

    if (tel === '') {
      $('#err-phone').text('⚠️ El número de celular / WhatsApp es obligatorio.').slideDown('fast');
      $('#client-phone').addClass('input-invalid');
      return false;
    }

    if (!regexTel.test(tel)) {
      $('#err-phone').text('⚠️ Ingresa un número válido de 7 a 10 dígitos numéricos (ej: 78854844).').slideDown('fast');
      $('#client-phone').addClass('input-invalid');
      return false;
    }

    $('#client-phone').addClass('input-valid');
    return true;
  }

  // Validación de Correo Electrónico
  function validarCampoEmail() {
    let correo = $('#client-email').val().trim();
    let regexEmail = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

    $('#client-email').removeClass('input-invalid input-valid');
    $('#err-email').hide().text('');

    if (correo === '') {
      $('#err-email').text('⚠️ El correo electrónico es obligatorio.').slideDown('fast');
      $('#client-email').addClass('input-invalid');
      return false;
    }

    if (!regexEmail.test(correo)) {
      $('#err-email').text('⚠️ Ingresa un formato de correo válido (ej: usuario@correo.com).').slideDown('fast');
      $('#client-email').addClass('input-invalid');
      return false;
    }

    $('#client-email').addClass('input-valid');
    return true;
  }

  // ==========================================================
  // EVENTOS BLUR / INPUT: VALIDAR AL SALIR DEL CAMPO O TOCARLO
  // ==========================================================
  // Al salir del campo (blur), si no se hizo nada o se dejó mal, se valida de inmediato
  $('#fecha-reserva').on('blur change', function() {
    validarCampoFecha();
    verificarFormularioCompleto();
  });

  $('#client-name').on('blur input', function() {
    validarCampoNombre();
    verificarFormularioCompleto();
  });

  $('#client-phone').on('blur input', function() {
    validarCampoTelefono();
    verificarFormularioCompleto();
  });

  $('#client-email').on('blur input', function() {
    validarCampoEmail();
    verificarFormularioCompleto();
  });

  // ==========================================================
  // ACTIVACIÓN DINÁMICA DEL BOTÓN CUANDO TODO ESTÁ VÁLIDO
  // ==========================================================
  function verificarFormularioCompleto() {
    let fechaOk = validarCampoFechaSilencioso();
    let horasOk = horasValidas;
    let nombreOk = validarCampoNombreSilencioso();
    let telefonoOk = validarCampoTelefonoSilencioso();
    let emailOk = validarCampoEmailSilencioso();

    let todoValido = fechaOk && horasOk && nombreOk && telefonoOk && emailOk;

    let $btn = $('#btn-submit-booking');

    if (todoValido) {
      // Habilitar botón, ponerlo en verde listo para enviar
      $btn
        .prop('disabled', false)
        .removeClass('btn-disabled')
        .addClass('btn-ready')
        .html('<i class="fa-solid fa-circle-check"></i> Confirmar y Reservar en Wally Park');
    } else {
      // Deshabilitar botón y mantenerlo en gris
      $btn
        .prop('disabled', true)
        .removeClass('btn-ready')
        .addClass('btn-disabled')
        .html('<i class="fa-solid fa-lock"></i> Completa los campos para reservar');
    }

    return todoValido;
  }

  // Funciones de validación silenciosa (comprueba estado sin mostrar errores antes de tiempo)
  function validarCampoFechaSilencioso() {
    let f = $('#fecha-reserva').val();
    return f && (f >= fechaHoyFormato);
  }

  function validarCampoNombreSilencioso() {
    let n = $('#client-name').val().trim();
    return /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,50}$/.test(n);
  }

  function validarCampoTelefonoSilencioso() {
    let t = $('#client-phone').val().trim();
    return /^[0-9]{7,10}$/.test(t);
  }

  function validarCampoEmailSilencioso() {
    let e = $('#client-email').val().trim();
    return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(e);
  }


  // ==========================================================
  // SUBMIT DEL FORMULARIO DE RESERVA -> APERTURA DEL MODAL UI
  // ==========================================================
  let timerInterval = null;
  let tiempoRestante = 30;

  $('#reservation-form').submit(function(e) {
    e.preventDefault();

    // Ejecutar todas las validaciones con alerta visible
    let vFecha = validarCampoFecha();
    let vHoras = validarHorarios();
    let vNombre = validarCampoNombre();
    let vTel = validarCampoTelefono();
    let vEmail = validarCampoEmail();

    if (!vFecha || !vHoras || !vNombre || !vTel || !vEmail) {
      mostrarAlertaError('⚠️ Revisa los campos resaltados en rojo antes de proceder.');
      verificarFormularioCompleto();
      return;
    }

    // Datos listos para pasar a la Ventana Modal UI
    let nombreCliente = $('#client-name').val().trim();
    let cancha = $('#summary-court').text();
    let total = $('#summary-total').text();
    let fecha = $('#fecha-reserva').val();
    let horas = horaFin - horaInicio;

    // Poblar datos en la Ventana Modal UI
    $('#modal-court-name').text(cancha);
    $('#modal-client-name').text(nombreCliente);
    $('#modal-schedule').text(`${fecha} (${horaInicio}:00 - ${horaFin}:00)`);
    $('#modal-guarantee').text('50 BOB (Reembolsable)');
    $('#modal-total-amount').text(`${total} (${horas} Horas)`);

    // Abrir Modal UI con fade
    registrarEventoTimestamp('MODAL', `Abrió modal de confirmación para ${nombreCliente} (${total})`);
    $('#modal-overlay').fadeIn(250);

    // Iniciar Temporizador Asíncrono de 30s (Puntos Extra +0.5)
    iniciarTemporizadorModal();
  });

  // Función del Temporizador Asíncrono de Reserva Expirable (setInterval)
  function iniciarTemporizadorModal() {
    clearInterval(timerInterval);
    tiempoRestante = 30;
    actualizarTextoTimer();

    timerInterval = setInterval(function() {
      tiempoRestante--;
      actualizarTextoTimer();

      if (tiempoRestante <= 0) {
        clearInterval(timerInterval);
        // Si el usuario no confirma dentro del tiempo límite:
        // El modal se cierra con .fadeOut() y muestra mensaje de Tarifa Flash Expirada
        $('#modal-overlay').fadeOut(300, function() {
          registrarEventoTimestamp('TIMER', 'Expiró el temporizador de 30s de la reserva');
          mostrarToastAlert(
            '⚠️ Tarifa Flash Expirada',
            'Se agotó el tiempo límite de 30 segundos. Por favor vuelve a confirmar tu reserva.',
            true
          );
        });
      }
    }, 1000);
  }

  function actualizarTextoTimer() {
    let seg = tiempoRestante < 10 ? `0${tiempoRestante}` : tiempoRestante;
    $('#modal-countdown').text(`00:${seg}s`);
  }

  // Cerrar Modal al hacer clic en [X] o en "Cancelar"
  $('#modal-close-btn, #modal-cancel-btn').click(function() {
    registrarEventoTimestamp('MODAL', 'Canceló la confirmación en la ventana modal');
    cerrarModal();
  });

  // Cerrar al hacer clic en el fondo oscuro
  $('#modal-overlay').click(function(e) {
    if ($(e.target).is('#modal-overlay')) {
      cerrarModal();
    }
  });

  function cerrarModal() {
    clearInterval(timerInterval);
    $('#modal-overlay').fadeOut(250);
  }

  // ==========================================================
  // BOTÓN "PROCESAR PAGO" EN EL MODAL -> TOAST ALERT PRO
  // ==========================================================
  $('#modal-confirm-btn').click(function() {
    clearInterval(timerInterval);

    contadorReservas++;
    localStorage.setItem('deporzone_orders', String(contadorReservas));
    registrarEventoTimestamp('RESERVA', `Confirmó reserva para ${$('#modal-client-name').text()} (${$('#modal-total-amount').text()})`);

    // Cerrar modal suavemente
    $('#modal-overlay').fadeOut(250, function() {
      // Feedback Dinámico de Alerta: Toast Alert flotante en la esquina superior derecha
      // Aparece con .slideDown(), permanece 3 segundos y desaparece con .fadeOut() (+0.5 pts)
      mostrarToastAlert(
        '¡Reserva Procesada con Éxito! 🏆',
        `Titular: ${$('#modal-client-name').text()} | Total: ${$('#modal-total-amount').text()}`,
        false
      );

      // Mostrar también resumen en panel de éxito
      let mensajeExito = `
        <strong>¡Reserva Registrada y Procesada! 🎉</strong><br>
        Canjea tu comprobante en caja de DeporZone Wally Park.<br>
        Garantía requerida: <strong>50 BOB</strong> | Total: <strong>${$('#modal-total-amount').text()}</strong>
      `;
      $('#booking-alert-success').html(mensajeExito).slideDown(300);

      // Limpiar campos tras procesar
      setTimeout(function() {
        $('#client-name, #client-phone, #client-email, #client-notes').val('');
        $('input, select').removeClass('input-valid input-invalid');
        verificarFormularioCompleto();
      }, 3500);
    });
  });

  // Función para mostrar el Toast Alert Dinámico
  function mostrarToastAlert(titulo, mensaje, esWarning) {
    let $toast = $('#toast-alert');
    $('#toast-title').text(titulo);
    $('#toast-message').text(mensaje);

    if (esWarning) {
      $toast.addClass('toast-warning');
      $toast.find('.toast-icon i').attr('class', 'fa-solid fa-triangle-exclamation');
    } else {
      $toast.removeClass('toast-warning');
      $toast.find('.toast-icon i').attr('class', 'fa-solid fa-circle-check');
    }

    // Aparece con .slideDown(), permanece 3 segundos y desaparece con .fadeOut()
    $toast.stop(true, true).slideDown(300).delay(3000).fadeOut(400);
  }

  // ==========================================================
  // FUNCIÓN 5: REDES SOCIALES INTERACTIVAS Y .fadeToggle()
  // ==========================================================
  $('#toggle-social-btn').click(function() {
    $('#social-collapsible-box').fadeToggle(300);
    registrarEventoTimestamp('UI', 'Alternó visibilidad de Redes Sociales (.fadeToggle)');
  });

  $('.social-card').click(function(e) {
    e.preventDefault();
    let redNombre = $(this).data('network');
    let urlDestino = $(this).attr('href');

    registrarEventoTimestamp('SOCIAL', `Abrió red social oficial: ${redNombre}`);
    mostrarToastAlert(
      '🌐 Canal Oficial DeporZone',
      `Abriendo ${redNombre}...`,
      false
    );

    setTimeout(function() {
      window.open(urlDestino, '_blank', 'noopener');
    }, 650);
  });

  // Inicialización de la pantalla al cargar
  $('#select-cancha-reserva').trigger('change');
  validarHorarios();
  verificarFormularioCompleto();
  renderizarBitacora();
  registrarEventoTimestamp('SISTEMA', 'Inició sesión en DeporZone Wally Park');

});
