/* ==========================================================
   GRILLHOUSE BURGER CLUB - LÓGICA DE INTERACCIÓN CON JQUERY
   Materia: Diseño Web II (Ingeniería de Sistemas)
   Proyecto Grupal: Hamburguesería Artesanal + Sistema de Eventos y Timestamp
   Funciones Clave:
     1. Menú Hamburguesa responsive permanente (.slideToggle)
     2. Modo Oscuro y Claro (.toggleClass, .hide, .show, .fadeIn)
     3. Filtrado por Categorías y Especialidades (.fadeIn, .fadeOut, .slideToggle)
     4. Sistema de Eventos y Bitácora con Timestamp (.fadeToggle, LocalStorage)
     5. Formulario de Pedido con cálculo en vivo, validación en tiempo real / blur y Modal Asíncrono
   ========================================================== */

$(document).ready(function() {

  // ==========================================================
  // SISTEMA DE BITÁCORA DE EVENTOS CON TIMESTAMP (PROYECTO GRUPAL)
  // ==========================================================
  let historialEventos = JSON.parse(localStorage.getItem('grillhouse_logs') || '[]');
  let contadorFiltros = parseInt(localStorage.getItem('grillhouse_filters') || '0');
  let contadorPedidos = parseInt(localStorage.getItem('grillhouse_orders') || '0');

  function registrarEventoTimestamp(tipo, descripcion) {
    const ahora = new Date();
    const fechaHora = ahora.toLocaleString('es-BO', {
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

    // Mantener máximo 40 registros recientes
    historialEventos = historialEventos.slice(0, 40);
    localStorage.setItem('grillhouse_logs', JSON.stringify(historialEventos));

    renderizarBitacora();
  }

  function renderizarBitacora() {
    let $lista = $('#activity-log-list');
    $lista.empty();

    $('#stat-total-events').text(historialEventos.length);
    $('#stat-filter-events').text(contadorFiltros);
    $('#stat-order-events').text(contadorPedidos);

    if (historialEventos.length === 0) {
      $lista.append('<div class="log-entry"><span class="log-message">Bitácora vacía. Interactúa con el menú o el formulario para registrar eventos con Timestamp.</span></div>');
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
    contadorPedidos = 0;
    localStorage.removeItem('grillhouse_logs');
    localStorage.setItem('grillhouse_filters', '0');
    localStorage.setItem('grillhouse_orders', '0');
    renderizarBitacora();
    mostrarToastAlert('🧹 Bitácora Reiniciada', 'El historial de eventos con Timestamp fue limpiado correctamente.', false);
  });


  // ==========================================================
  // FUNCIÓN 1: MENÚ HAMBURGUESA PERMANENTE (DESPLEGABLE ELEGANTE)
  // ==========================================================
  $('#hamburger-btn').click(function(e) {
    e.stopPropagation();
    $('#navbar').slideToggle(250);
    registrarEventoTimestamp('NAV', 'Desplegó / ocultó el menú hamburguesa con .slideToggle()');
  });

  $('.nav-link').click(function() {
    $('#navbar').slideUp(200);
    $('.nav-link').removeClass('active');
    $(this).addClass('active');
    registrarEventoTimestamp('NAV', `Navegó a la sección: ${$(this).text().trim()}`);
  });

  $(document).click(function(e) {
    if (!$(e.target).closest('#main-header').length) {
      $('#navbar').slideUp(200);
    }
  });


  // ==========================================================
  // FUNCIÓN 2: MODO OSCURO Y CLARO (DARK / LIGHT MODE)
  // ==========================================================
  $('#theme-toggle-btn').click(function() {
    $('body').toggleClass('theme-dark');

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
  // FUNCIÓN 3: FILTRADO DEL MENÚ POR CATEGORÍAS Y ESPECIALIDADES
  // ==========================================================
  let filtroTipoActual = 'all';
  let filtroSubtipoActual = 'all';

  // 3.1 Clic en botones de Categoría Principal
  $('.type-btn').click(function() {
    $('.type-btn').removeClass('active');
    $(this).addClass('active');

    filtroTipoActual = $(this).data('type');
    contadorFiltros++;
    localStorage.setItem('grillhouse_filters', String(contadorFiltros));
    registrarEventoTimestamp('FILTRO', `Filtró por categoría: ${$(this).text().trim()}`);
    aplicarFiltros();
  });

  // 3.2 Clic en botones de Subtipo de Especialidad
  $('.subtype-btn').click(function() {
    $('.subtype-btn').removeClass('active');
    $(this).addClass('active');

    filtroSubtipoActual = $(this).data('subtype');
    contadorFiltros++;
    localStorage.setItem('grillhouse_filters', String(contadorFiltros));
    registrarEventoTimestamp('FILTRO', `Filtró por especialidad: ${$(this).text().trim()}`);
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

  // 3.4 Botón "Seleccionar" en una tarjeta del menú
  $('.btn-select-court').click(function() {
    let burgerId = $(this).data('court-id');
    let burgerName = $(this).data('court-name');

    $('#select-cancha-reserva').val(burgerId).trigger('change');
    registrarEventoTimestamp('MENÚ', `Seleccionó del catálogo: ${burgerName}`);

    $('html, body').animate({
      scrollTop: $('#booking-section').offset().top - 80
    }, 500);
  });

  // 3.5 Pestaña Acordeón: Plegar y Desplegar Menú (.slideToggle)
  $('#toggle-catalog-btn').click(function() {
    let $btn = $(this);
    let $wrapper = $('#catalog-collapsible-wrapper');

    $wrapper.slideToggle(350, function() {
      if ($wrapper.is(':visible')) {
        $btn.removeClass('collapsed').attr('aria-expanded', 'true');
        $btn.find('.toggle-text').html('<i class="fa-solid fa-eye-slash"></i> Ocultar Menú de Hamburguesas');
        registrarEventoTimestamp('UI', 'Desplegó el catálogo gastronómico (.slideToggle)');
      } else {
        $btn.addClass('collapsed').attr('aria-expanded', 'false');
        $btn.find('.toggle-text').html('<i class="fa-solid fa-eye"></i> Ver / Mostrar Menú de Hamburguesas');
        registrarEventoTimestamp('UI', 'Ocultó el catálogo gastronómico (.slideToggle)');
      }
    });
  });


  // ==========================================================
  // FUNCIÓN 4: FORMULARIO DE PEDIDO, VALIDACIONES Y CÁLCULO
  // ==========================================================

  // 4.1 Configurar fecha mínima permitida (HOY)
  const ahora = new Date();
  const yyyy = ahora.getFullYear();
  const mm = String(ahora.getMonth() + 1).padStart(2, '0');
  const dd = String(ahora.getDate()).padStart(2, '0');
  const fechaHoyFormato = `${yyyy}-${mm}-${dd}`;

  $('#fecha-reserva').attr('min', fechaHoyFormato).val(fechaHoyFormato);

  // Variables de control de turno, cantidad y precios
  let precioPlato = 48;
  let horaTurno = 20;
  let cantidadOrdenes = 1;
  let turnoValido = true;

  // Bloques horarios saturados en cocina
  const bloquesSaturados = [19, 22];

  // 4.2 Clic en los botones de Turnos Rápidos de Despacho (.btn-slot)
  $('.btn-slot').click(function() {
    let hIni = parseInt($(this).data('inicio'));
    let hFin = parseInt($(this).data('fin'));

    if ($(this).hasClass('ocupado')) {
      mostrarAlertaError(`⛔ El bloque horario de ${hIni}:00 a ${hFin}:00 tiene cupo lleno en parrilla. Elige otro horario libre.`);
      registrarEventoTimestamp('ALERTA', `Intentó seleccionar turno saturado (${hIni}:00 - ${hFin}:00)`);
      return;
    }

    $('.btn-slot:not(.ocupado)').removeClass('active-slot');
    $(this).addClass('active-slot');

    horaTurno = hIni;
    $('#select-inicio').val(horaTurno);

    registrarEventoTimestamp('TURNO', `Seleccionó turno de despacho ${hIni}:00 a ${hFin}:00 hrs`);
    validarHorariosYCantidad();
    calcularTotalReserva();
    verificarFormularioCompleto();
  });

  // 4.3 Cambio en selectores de Bloque Horario y Cantidad de Órdenes
  $('#select-inicio, #select-fin').on('change blur', function() {
    horaTurno = parseInt($('#select-inicio').val());
    cantidadOrdenes = parseInt($('#select-fin').val()) || 1;

    validarHorariosYCantidad();
    calcularTotalReserva();
    verificarFormularioCompleto();
  });

  function validarHorariosYCantidad() {
    $('#select-inicio, #select-fin').removeClass('input-invalid input-valid');
    $('#err-hours').hide().text('');
    turnoValido = false;

    if (bloquesSaturados.includes(horaTurno)) {
      let hFin = horaTurno + 1;
      $('#err-hours').text(`⛔ El turno de ${horaTurno}:00 a ${hFin}:00 hrs está saturado en cocina. Elige un bloque libre.`).slideDown('fast');
      $('#select-inicio').addClass('input-invalid');
      $('.btn-slot').removeClass('active-slot');
      mostrarAlertaError(`⛔ Turno de cocina saturado (${horaTurno}:00 a ${hFin}:00). Por favor selecciona otro horario.`);
      return false;
    }

    if (cantidadOrdenes <= 0 || cantidadOrdenes > 5) {
      $('#err-hours').text('⚠️ Selecciona entre 1 y 5 órdenes por pedido rápido.').slideDown('fast');
      $('#select-fin').addClass('input-invalid');
      return false;
    }

    turnoValido = true;
    $('#select-inicio, #select-fin').addClass('input-valid');
    $('#err-hours').slideUp('fast');
    $('#booking-alert-error').slideUp('fast');

    $('.btn-slot').removeClass('active-slot');
    $(`.btn-slot[data-inicio="${horaTurno}"]:not(.ocupado)`).addClass('active-slot');

    return true;
  }

  // 4.4 Cambio de Hamburguesa / Combo Seleccionado
  $('#select-cancha-reserva').change(function() {
    let optSeleccionada = $(this).find('option:selected');
    precioPlato = parseInt(optSeleccionada.data('precio')) || 48;

    let nombrePlato = optSeleccionada.text().split('(')[0].trim();
    $('#summary-court').text(nombrePlato);

    calcularTotalReserva();
  });

  // 4.5 Cambio en Adicionales Parrilleros
  $('input[name="add-ball"], input[name="add-vests"], input[name="add-water"]').change(function() {
    registrarEventoTimestamp('EXTRA', 'Actualizó guarniciones / adicionales del pedido');
    calcularTotalReserva();
  });

  // 4.6 Función central de cálculo y actualización en vivo del resumen
  function calcularTotalReserva() {
    if (!turnoValido || cantidadOrdenes <= 0) {
      $('#summary-hours').text('0 Órdenes');
      $('#summary-time').text('Turno Saturado');
      $('#summary-total').text('0 BOB').css('color', '#e53935');
      return;
    }

    let subtotalMenu = cantidadOrdenes * precioPlato;

    let totalAdicionales = 0;
    if ($('#add-ball').is(':checked')) totalAdicionales += parseInt($('#add-ball').val());
    if ($('#add-vests').is(':checked')) totalAdicionales += parseInt($('#add-vests').val());
    if ($('#add-water').is(':checked')) totalAdicionales += parseInt($('#add-water').val());

    let granTotal = subtotalMenu + totalAdicionales;
    let horaFinTexto = horaTurno === 23 ? '00:00' : `${horaTurno + 1}:00`;

    $('#summary-hours').text(`${cantidadOrdenes} Orden(es)`);
    $('#summary-time').text(`${horaTurno}:00 a ${horaFinTexto} hrs`);

    $('#summary-total')
      .text(`${granTotal} BOB`)
      .css('color', '#ea580c')
      .animate({ fontSize: '1.4rem' }, 120)
      .animate({ fontSize: '1.25rem' }, 120);
  }

  // 4.7 Función auxiliar para mostrar alertas de error
  function mostrarAlertaError(mensaje) {
    $('#booking-alert-success').hide();
    $('#booking-alert-error').html(mensaje).show().slideDown('fast');
  }


  // ==========================================================
  // FUNCIONES DE VALIDACIÓN INDIVIDUAL (PARA BLUR / INPUT)
  // ==========================================================

  function validarCampoFecha() {
    let valorFecha = $('#fecha-reserva').val();
    $('#fecha-reserva').removeClass('input-invalid input-valid');
    $('#err-date').hide().text('');

    if (!valorFecha) {
      $('#err-date').text('⚠️ Debes seleccionar una fecha para tu pedido.').slideDown('fast');
      $('#fecha-reserva').addClass('input-invalid');
      return false;
    }

    if (valorFecha < fechaHoyFormato) {
      $('#err-date').text('⚠️ No puedes realizar pedidos en una fecha pasada.').slideDown('fast');
      $('#fecha-reserva').addClass('input-invalid');
      return false;
    }

    $('#fecha-reserva').addClass('input-valid');
    return true;
  }

  function validarCampoNombre() {
    let nombre = $('#client-name').val().trim();
    let regexNombre = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,50}$/;

    $('#client-name').removeClass('input-invalid input-valid');
    $('#err-name').hide().text('');

    if (nombre === '') {
      $('#err-name').text('⚠️ El nombre completo del cliente es obligatorio.').slideDown('fast');
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

  function validarCampoTelefono() {
    let tel = $('#client-phone').val().trim();
    let regexTel = /^[0-9]{7,10}$/;

    $('#client-phone').removeClass('input-invalid input-valid');
    $('#err-phone').hide().text('');

    if (tel === '') {
      $('#err-phone').text('⚠️ El número de celular / WhatsApp es obligatorio para el delivery.').slideDown('fast');
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

  function validarCampoEmail() {
    let correo = $('#client-email').val().trim();
    let regexEmail = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

    $('#client-email').removeClass('input-invalid input-valid');
    $('#err-email').hide().text('');

    if (correo === '') {
      $('#err-email').text('⚠️ El correo electrónico es obligatorio para el envío de tu comprobante.').slideDown('fast');
      $('#client-email').addClass('input-invalid');
      return false;
    }

    if (!regexEmail.test(correo)) {
      $('#err-email').text('⚠️ Ingresa un formato de correo válido (ej: cliente@correo.com).').slideDown('fast');
      $('#client-email').addClass('input-invalid');
      return false;
    }

    $('#client-email').addClass('input-valid');
    return true;
  }

  // ==========================================================
  // EVENTOS BLUR / INPUT: VALIDAR AL SALIR DEL CAMPO O TOCARLO
  // ==========================================================
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
    let turnoOk = turnoValido;
    let nombreOk = validarCampoNombreSilencioso();
    let telefonoOk = validarCampoTelefonoSilencioso();
    let emailOk = validarCampoEmailSilencioso();

    let todoValido = fechaOk && turnoOk && nombreOk && telefonoOk && emailOk;

    let $btn = $('#btn-submit-booking');

    if (todoValido) {
      $btn
        .prop('disabled', false)
        .removeClass('btn-disabled')
        .addClass('btn-ready')
        .html('<i class="fa-solid fa-circle-check"></i> Confirmar Pedido en GrillHouse');
    } else {
      $btn
        .prop('disabled', true)
        .removeClass('btn-ready')
        .addClass('btn-disabled')
        .html('<i class="fa-solid fa-lock"></i> Completa los campos para pedir');
    }

    return todoValido;
  }

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
  // FUNCIÓN 5: REDES SOCIALES INTERACTIVAS
  // ==========================================================
  $('.social-card').click(function(e) {
    e.preventDefault();
    let redNombre = $(this).data('network');
    let urlDestino = $(this).attr('href');

    registrarEventoTimestamp('SOCIAL', `Abrió enlace de red social: ${redNombre}`);
    mostrarToastAlert(
      '🍔 Red Social Oficial GrillHouse',
      `Redirigiendo a ${redNombre}...`,
      false
    );

    setTimeout(function() {
      window.open(urlDestino, '_blank', 'noopener');
    }, 650);
  });


  // ==========================================================
  // SUBMIT DEL FORMULARIO DE PEDIDO -> APERTURA DEL MODAL UI
  // ==========================================================
  let timerInterval = null;
  let tiempoRestante = 30;

  $('#reservation-form').submit(function(e) {
    e.preventDefault();

    let vFecha = validarCampoFecha();
    let vTurno = validarHorariosYCantidad();
    let vNombre = validarCampoNombre();
    let vTel = validarCampoTelefono();
    let vEmail = validarCampoEmail();

    if (!vFecha || !vTurno || !vNombre || !vTel || !vEmail) {
      mostrarAlertaError('⚠️ Revisa los campos resaltados en rojo antes de enviar tu comanda.');
      registrarEventoTimestamp('ERROR', 'Intento de envío con campos incompletos');
      verificarFormularioCompleto();
      return;
    }

    let nombreCliente = $('#client-name').val().trim();
    let plato = $('#summary-court').text();
    let total = $('#summary-total').text();
    let fecha = $('#fecha-reserva').val();
    let horaFinTexto = horaTurno === 23 ? '00:00' : `${horaTurno + 1}:00`;

    $('#modal-court-name').text(plato);
    $('#modal-client-name').text(nombreCliente);
    $('#modal-schedule').text(`${fecha} (${horaTurno}:00 - ${horaFinTexto})`);
    $('#modal-guarantee').text('Empaque Térmico Sellado Gratis');
    $('#modal-total-amount').text(`${total} (${cantidadOrdenes} Orden/es)`);

    registrarEventoTimestamp('MODAL', `Abrió modal de confirmación para ${nombreCliente} (${total})`);

    $('#modal-overlay').fadeIn(250);
    iniciarTemporizadorModal();
  });

  function iniciarTemporizadorModal() {
    clearInterval(timerInterval);
    tiempoRestante = 30;
    actualizarTextoTimer();

    timerInterval = setInterval(function() {
      tiempoRestante--;
      actualizarTextoTimer();

      if (tiempoRestante <= 0) {
        clearInterval(timerInterval);
        $('#modal-overlay').fadeOut(300, function() {
          registrarEventoTimestamp('TIMER', 'Expiró el temporizador de 30s de la comanda');
          mostrarToastAlert(
            '⚠️ Turno de Cocina Expirado',
            'Se agotó el tiempo límite de 30 segundos. Por favor vuelve a confirmar tu pedido.',
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

  $('#modal-close-btn, #modal-cancel-btn').click(function() {
    registrarEventoTimestamp('MODAL', 'Canceló la ventana de confirmación de comanda');
    cerrarModal();
  });

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
  // BOTÓN "ENVIAR A COCINA" EN EL MODAL -> TOAST ALERT PRO
  // ==========================================================
  $('#modal-confirm-btn').click(function() {
    clearInterval(timerInterval);

    contadorPedidos++;
    localStorage.setItem('grillhouse_orders', String(contadorPedidos));
    registrarEventoTimestamp('PEDIDO', `Comanda procesada exitosamente para ${$('#modal-client-name').text()} (${$('#modal-total-amount').text()})`);

    $('#modal-overlay').fadeOut(250, function() {
      mostrarToastAlert(
        '¡Comanda Enviada a Parrilla! 🍔🔥',
        `Cliente: ${$('#modal-client-name').text()} | Total: ${$('#modal-total-amount').text()}`,
        false
      );

      let mensajeExito = `
        <strong>¡Pedido Registrado en Cocina! 🎉</strong><br>
        Tu orden en GrillHouse Burger Club está en preparación (${$('#modal-schedule').text()}).<br>
        Total confirmado: <strong>${$('#modal-total-amount').text()}</strong>
      `;
      $('#booking-alert-success').html(mensajeExito).slideDown(300);

      setTimeout(function() {
        $('#client-name, #client-phone, #client-email, #client-notes').val('');
        $('input, select').removeClass('input-valid input-invalid');
        verificarFormularioCompleto();
      }, 3500);
    });
  });

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

    $toast.stop(true, true).slideDown(300).delay(3000).fadeOut(400);
  }

  // Inicialización de la pantalla al cargar
  $('#select-cancha-reserva').trigger('change');
  validarHorariosYCantidad();
  verificarFormularioCompleto();
  renderizarBitacora();
  registrarEventoTimestamp('SISTEMA', 'Inició sesión en GrillHouse Burger Club');

});

