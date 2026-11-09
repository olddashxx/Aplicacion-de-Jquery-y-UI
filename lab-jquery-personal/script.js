/* ==========================================================
   URBANVOGUE STUDIO - LÓGICA DE INTERACCIÓN CON JQUERY
   Materia: Diseño Web II (Ingeniería de Sistemas)
   Proyecto Personal: Tienda de Ropa & Catálogo Interactivo
   Funciones Clave:
     1. Menú Hamburguesa responsive permanente (.slideToggle)
     2. Modo Oscuro y Claro (.toggleClass, .hide, .show, .fadeIn)
     3. Filtrado por Tipos y Subtipos de Ropa (.fadeIn, .fadeOut, .slideToggle, .fadeToggle)
     4. Formulario de Pedido con cálculo en vivo, validación en tiempo real / blur y activación dinámica
     5. Integración interactiva con Redes Sociales y Modal con Temporizador Asíncrono
   ========================================================== */

$(document).ready(function() {

  // ==========================================================
  // SISTEMA DE BITÁCORA DE EVENTOS CON TIMESTAMP (URBANVOGUE)
  // ==========================================================
  let historialEventos = JSON.parse(localStorage.getItem('urbanvogue_logs') || '[]');
  let contadorFiltros = parseInt(localStorage.getItem('urbanvogue_filters') || '0');
  let contadorCompras = parseInt(localStorage.getItem('urbanvogue_orders') || '0');

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
    localStorage.setItem('urbanvogue_logs', JSON.stringify(historialEventos));

    renderizarBitacora();
  }

  function renderizarBitacora() {
    let $lista = $('#activity-log-list');
    $lista.empty();

    $('#stat-total-events').text(historialEventos.length);
    $('#stat-filter-events').text(contadorFiltros);
    $('#stat-order-events').text(contadorCompras);

    if (historialEventos.length === 0) {
      $lista.append('<div class="log-entry"><span class="log-message">Bitácora vacía. Interactúa con el catálogo de prendas o el formulario para registrar eventos con Timestamp.</span></div>');
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

  $('#toggle-log-btn').click(function() {
    $('#log-collapsible-box').fadeToggle(300);
    registrarEventoTimestamp('UI', 'Alternó visibilidad de la Bitácora con .fadeToggle()');
  });

  $('#clear-log-btn').click(function() {
    historialEventos = [];
    contadorFiltros = 0;
    contadorCompras = 0;
    localStorage.removeItem('urbanvogue_logs');
    localStorage.setItem('urbanvogue_filters', '0');
    localStorage.setItem('urbanvogue_orders', '0');
    renderizarBitacora();
    mostrarToastAlert('🧹 Bitácora Reiniciada', 'El historial de eventos con Timestamp fue limpiado correctamente.', false);
  });


  // ==========================================================
  // FUNCIÓN 1: MENÚ HAMBURGUESA PERMANENTE (DESPLEGABLE ELEGANTE)
  // ==========================================================
  $('#hamburger-btn').click(function(e) {
    e.stopPropagation();
    $('#navbar').slideToggle(250);
    registrarEventoTimestamp('NAV', 'Desplegó / ocultó el menú hamburguesa (.slideToggle)');
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
  // FUNCIÓN 3: FILTRADO DE PRENDAS POR TIPOS Y SUBTIPOS
  // ==========================================================
  let filtroTipoActual = 'all';
  let filtroSubtipoActual = 'all';

  // 3.1 Clic en botones de Tipo de Prenda
  $('.type-btn').click(function() {
    $('.type-btn').removeClass('active');
    $(this).addClass('active');

    filtroTipoActual = $(this).data('type');
    contadorFiltros++;
    localStorage.setItem('urbanvogue_filters', String(contadorFiltros));
    registrarEventoTimestamp('FILTRO', `Filtró por tipo de prenda: ${$(this).text().trim()}`);
    aplicarFiltros();
  });

  // 3.2 Clic en botones de Subtipo de Colección
  $('.subtype-btn').click(function() {
    $('.subtype-btn').removeClass('active');
    $(this).addClass('active');

    filtroSubtipoActual = $(this).data('subtype');
    contadorFiltros++;
    localStorage.setItem('urbanvogue_filters', String(contadorFiltros));
    registrarEventoTimestamp('FILTRO', `Filtró por colección: ${$(this).text().trim()}`);
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

  // 3.4 Botón "Seleccionar" en una tarjeta del catálogo de ropa
  $('.btn-select-court').click(function() {
    let prendaId = $(this).data('court-id');
    let prendaNombre = $(this).data('court-name');

    // Seleccionar automáticamente la prenda en el dropdown del formulario
    $('#select-cancha-reserva').val(prendaId).trigger('change');
    registrarEventoTimestamp('PRENDA', `Seleccionó del catálogo: ${prendaNombre}`);

    // Desplazamiento suave hasta el formulario de compra
    $('html, body').animate({
      scrollTop: $('#booking-section').offset().top - 80
    }, 500);
  });

  // 3.5 Pestaña Acordeón: Plegar y Desplegar Catálogo (.slideToggle)
  $('#toggle-catalog-btn').click(function() {
    let $btn = $(this);
    let $wrapper = $('#catalog-collapsible-wrapper');

    $wrapper.slideToggle(350, function() {
      if ($wrapper.is(':visible')) {
        $btn.removeClass('collapsed').attr('aria-expanded', 'true');
        $btn.find('.toggle-text').html('<i class="fa-solid fa-eye-slash"></i> Ocultar Catálogo de Ropa');
        registrarEventoTimestamp('UI', 'Desplegó el catálogo de ropa (.slideToggle)');
      } else {
        $btn.addClass('collapsed').attr('aria-expanded', 'false');
        $btn.find('.toggle-text').html('<i class="fa-solid fa-eye"></i> Ver / Mostrar Catálogo de Ropa');
        registrarEventoTimestamp('UI', 'Ocultó el catálogo de ropa (.slideToggle)');
      }
    });
  });

  // 3.6 Botón Guía de Tallas con .fadeToggle()
  $('#toggle-size-guide-btn').click(function() {
    $('#size-guide-box').fadeToggle(300);
    registrarEventoTimestamp('UI', 'Alternó Tabla de Guía de Tallas (.fadeToggle)');
  });


  // ==========================================================
  // FUNCIÓN 4: FORMULARIO DE PEDIDO, VALIDACIONES Y CÁLCULO EN VIVO
  // ==========================================================

  // 4.1 Configurar fecha mínima permitida (HOY)
  const ahora = new Date();
  const yyyy = ahora.getFullYear();
  const mm = String(ahora.getMonth() + 1).padStart(2, '0');
  const dd = String(ahora.getDate()).padStart(2, '0');
  const fechaHoyFormato = `${yyyy}-${mm}-${dd}`;

  $('#fecha-reserva').attr('min', fechaHoyFormato).val(fechaHoyFormato);

  // Variables de control de talla, cantidad y precios
  let precioUnitario = 180;
  let tallaActual = 'L';
  let cantidadUnidades = 1;
  let tallaValida = true;

  // Tallas agotadas para demostración de validación en vivo
  const tallasAgotadas = ['M', 'XXL'];

  // 4.2 Clic en los botones de Tallas Rápidas (.btn-slot)
  $('.btn-slot').click(function() {
    let tallaClick = $(this).data('talla');

    if ($(this).hasClass('ocupado')) {
      mostrarAlertaError(`⛔ La Talla ${tallaClick} se encuentra agotada temporalmente. Por favor elige otra talla disponible.`);
      return;
    }

    $('.btn-slot:not(.ocupado)').removeClass('active-slot');
    $(this).addClass('active-slot');

    tallaActual = tallaClick;
    $('#select-talla').val(tallaActual);

    validarSeleccionTallaYCantidad();
    calcularTotalReserva();
    verificarFormularioCompleto();
  });

  // 4.3 Cambio en selectores de Talla y Cantidad de Unidades
  $('#select-talla, #select-cantidad').on('change blur', function() {
    tallaActual = $('#select-talla').val();
    cantidadUnidades = parseInt($('#select-cantidad').val()) || 1;

    validarSeleccionTallaYCantidad();
    calcularTotalReserva();
    verificarFormularioCompleto();
  });

  // Función dedicada a validar la talla y cantidad
  function validarSeleccionTallaYCantidad() {
    $('#select-talla, #select-cantidad').removeClass('input-invalid input-valid');
    $('#err-hours').hide().text('');
    tallaValida = false;

    if (tallasAgotadas.includes(tallaActual)) {
      $('#err-hours').text(`⛔ La Talla ${tallaActual} está agotada en almacén. Selecciona XS, S, L o XL.`).slideDown('fast');
      $('#select-talla').addClass('input-invalid');
      $('.btn-slot').removeClass('active-slot');
      mostrarAlertaError(`⛔ Stock agotado para Talla ${tallaActual}. Elige una talla disponible.`);
      return false;
    }

    if (cantidadUnidades <= 0 || cantidadUnidades > 5) {
      $('#err-hours').text('⚠️ Selecciona una cantidad válida (entre 1 y 5 unidades por orden).').slideDown('fast');
      $('#select-cantidad').addClass('input-invalid');
      return false;
    }

    // Selección válida
    tallaValida = true;
    $('#select-talla, #select-cantidad').addClass('input-valid');
    $('#err-hours').slideUp('fast');
    $('#booking-alert-error').slideUp('fast');

    $('.btn-slot').removeClass('active-slot');
    $(`.btn-slot[data-talla="${tallaActual}"]:not(.ocupado)`).addClass('active-slot');

    return true;
  }

  // 4.4 Cambio de Prenda Seleccionada
  $('#select-cancha-reserva').change(function() {
    let optSeleccionada = $(this).find('option:selected');
    precioUnitario = parseInt(optSeleccionada.data('precio')) || 180;

    let nombrePrenda = optSeleccionada.text().split('(')[0].trim();
    $('#summary-court').text(nombrePrenda);

    calcularTotalReserva();
  });

  // 4.5 Cambio en Opciones Adicionales
  $('input[name="add-ball"], input[name="add-vests"], input[name="add-water"]').change(function() {
    calcularTotalReserva();
  });

  // 4.6 Función central de cálculo y actualización en vivo del resumen
  function calcularTotalReserva() {
    if (!tallaValida || cantidadUnidades <= 0) {
      $('#summary-hours').text('0 Unidades');
      $('#summary-time').text(`Talla ${tallaActual} (Sin Stock)`);
      $('#summary-total').text('0 BOB').css('color', '#e53935');
      return;
    }

    let subtotalPrendas = cantidadUnidades * precioUnitario;

    let totalAdicionales = 0;
    if ($('#add-ball').is(':checked')) totalAdicionales += parseInt($('#add-ball').val());
    if ($('#add-vests').is(':checked')) totalAdicionales += parseInt($('#add-vests').val());
    if ($('#add-water').is(':checked')) totalAdicionales += parseInt($('#add-water').val());

    let granTotal = subtotalPrendas + totalAdicionales;

    $('#summary-hours').text(`${cantidadUnidades} Unidad(es)`);
    $('#summary-time').text(`Talla ${tallaActual} (En Stock)`);

    $('#summary-total')
      .text(`${granTotal} BOB`)
      .css('color', '#4f46e5')
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
      $('#err-date').text('⚠️ Debes seleccionar una fecha de entrega o recojo.').slideDown('fast');
      $('#fecha-reserva').addClass('input-invalid');
      return false;
    }

    if (valorFecha < fechaHoyFormato) {
      $('#err-date').text('⚠️ No puedes programar entregas en fechas pasadas.').slideDown('fast');
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
      $('#err-name').text('⚠️ El nombre completo del comprador es obligatorio.').slideDown('fast');
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

  function validarCampoEmail() {
    let correo = $('#client-email').val().trim();
    let regexEmail = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

    $('#client-email').removeClass('input-invalid input-valid');
    $('#err-email').hide().text('');

    if (correo === '') {
      $('#err-email').text('⚠️ El correo electrónico es obligatorio para enviar tu recibo.').slideDown('fast');
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
  // EVENTOS BLUR / INPUT: VALIDACIÓN EN TIEMPO REAL
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
    let tallaOk = tallaValida;
    let nombreOk = validarCampoNombreSilencioso();
    let telefonoOk = validarCampoTelefonoSilencioso();
    let emailOk = validarCampoEmailSilencioso();

    let todoValido = fechaOk && tallaOk && nombreOk && telefonoOk && emailOk;

    let $btn = $('#btn-submit-booking');

    if (todoValido) {
      $btn
        .prop('disabled', false)
        .removeClass('btn-disabled')
        .addClass('btn-ready')
        .html('<i class="fa-solid fa-circle-check"></i> Confirmar Pedido en UrbanVogue');
    } else {
      $btn
        .prop('disabled', true)
        .removeClass('btn-ready')
        .addClass('btn-disabled')
        .html('<i class="fa-solid fa-lock"></i> Completa los campos para comprar');
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

    registrarEventoTimestamp('SOCIAL', `Abrió red social oficial: ${redNombre}`);
    mostrarToastAlert(
      '🌐 Conectando con Red Social Oficial',
      `Abriendo ${redNombre} de UrbanVogue Studio...`,
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
    let vTalla = validarSeleccionTallaYCantidad();
    let vNombre = validarCampoNombre();
    let vTel = validarCampoTelefono();
    let vEmail = validarCampoEmail();

    if (!vFecha || !vTalla || !vNombre || !vTel || !vEmail) {
      mostrarAlertaError('⚠️ Revisa los campos resaltados en rojo antes de proceder con tu pedido.');
      verificarFormularioCompleto();
      return;
    }

    let nombreCliente = $('#client-name').val().trim();
    let prenda = $('#summary-court').text();
    let total = $('#summary-total').text();
    let fecha = $('#fecha-reserva').val();

    $('#modal-court-name').text(prenda);
    $('#modal-client-name').text(nombreCliente);
    $('#modal-schedule').text(`${fecha} (Talla ${tallaActual})`);
    $('#modal-guarantee').text('Cambio de Talla Gratis (7 días)');
    $('#modal-total-amount').text(`${total} (${cantidadUnidades} Unidad/es)`);

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
          registrarEventoTimestamp('TIMER', 'Expiró el temporizador de 30s de la orden');
          mostrarToastAlert(
            '⚠️ Reserva de Stock Expirada',
            'Se agotó el tiempo de 30 segundos para confirmar la prenda. Vuelve a enviar tu pedido.',
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
    registrarEventoTimestamp('MODAL', 'Canceló la confirmación en la ventana modal');
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
  // BOTÓN "CONFIRMAR COMPRA" EN EL MODAL -> TOAST ALERT PRO
  // ==========================================================
  $('#modal-confirm-btn').click(function() {
    clearInterval(timerInterval);

    contadorCompras++;
    localStorage.setItem('urbanvogue_orders', String(contadorCompras));
    registrarEventoTimestamp('COMPRA', `Confirmó pedido para ${$('#modal-client-name').text()} (${$('#modal-total-amount').text()})`);

    $('#modal-overlay').fadeOut(250, function() {
      mostrarToastAlert(
        '¡Compra Procesada con Éxito! 🛍️',
        `Cliente: ${$('#modal-client-name').text()} | Total: ${$('#modal-total-amount').text()}`,
        false
      );

      let mensajeExito = `
        <strong>¡Orden de Compra Registrada! 🎉</strong><br>
        Prenda apartada en UrbanVogue Studio (${$('#modal-schedule').text()}).<br>
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

  // Inicialización al cargar
  $('#select-cancha-reserva').trigger('change');
  validarSeleccionTallaYCantidad();
  verificarFormularioCompleto();
  renderizarBitacora();
  registrarEventoTimestamp('SISTEMA', 'Inició sesión en UrbanVogue Studio');

});

