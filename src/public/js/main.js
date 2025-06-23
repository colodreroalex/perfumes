// Función para mostrar mensajes de alerta
function showAlert(message, type = 'info') {
  const alertContainer = document.getElementById('alert-container');
  if (!alertContainer) return;

  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type}`;
  alertDiv.textContent = message;

  alertContainer.innerHTML = '';
  alertContainer.appendChild(alertDiv);

  // Auto-ocultar después de 5 segundos
  setTimeout(() => {
    alertDiv.remove();
  }, 5000);
}

// Función para mostrar el modal de login
function showLoginModal() {
  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'modal-overlay';
  modalOverlay.id = 'login-modal';

  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';

  modalContent.innerHTML = `
    <div class="modal-header">
      <h3 class="modal-title">Acceso Administrador</h3>
      <button class="modal-close" onclick="closeModal()">&times;</button>
    </div>
    <div id="login-alert-container"></div>
    <form id="login-form">
      <div class="form-group">
        <label for="email" class="form-label">Email</label>
        <input type="email" id="email" name="email" class="form-input" required>
      </div>
      <div class="form-group">
        <label for="password" class="form-label">Contraseña</label>
        <input type="password" id="password" name="password" class="form-input" required>
      </div>
      <button type="submit" class="btn btn-primary btn-block">Iniciar Sesión</button>
    </form>
    <p style="margin-top: 1rem; text-align: center; font-size: 0.9rem;">
      Esta área es exclusiva para administradores.
    </p>
  `;

  modalOverlay.appendChild(modalContent);
  document.body.appendChild(modalOverlay);

  // Prevenir que el click en el contenido cierre el modal
  modalContent.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  // Cerrar el modal al hacer click fuera del contenido
  modalOverlay.addEventListener('click', () => {
    closeModal();
  });

  // Manejar el envío del formulario de login
  const loginForm = document.getElementById('login-form');
  loginForm.addEventListener('submit', handleLogin);
}

// Función para cerrar el modal
function closeModal() {
  const modal = document.getElementById('login-modal');
  if (modal) {
    modal.remove();
  }
}

// Función para manejar el login
async function handleLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Error al iniciar sesión');
    }
    
    // Guardar el token en localStorage
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    // Cerrar el modal de login
    closeModal();
    
    // Actualizar la interfaz de usuario
    updateAuthUI();
    
    // Mostrar mensaje de éxito
    showAlert('Sesión iniciada correctamente', 'success');
    
    // Redirigir al panel de administración
    window.location.href = '/admin';
  } catch (error) {
    const alertContainer = document.getElementById('login-alert-container');
    if (alertContainer) {
      alertContainer.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
    }
  }
}

// Función para verificar si el usuario está autenticado
function isAuthenticated() {
  return localStorage.getItem('token') !== null;
}

// Función para verificar la autenticación al cargar páginas de administración
async function checkAdminAuth() {
  // Verificar si estamos en una página de administración
  if (window.location.pathname.startsWith('/admin')) {
    const token = localStorage.getItem('token');
    
    // Si no hay token, redirigir al inicio
    if (!token) {
      window.location.href = '/';
      return;
    }
    
    try {
      // Verificar si el token es válido
      const response = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        // Si el token no es válido, eliminar del localStorage y redirigir
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Error al verificar autenticación:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
  }
}

// Función para cerrar sesión
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // Actualizar la interfaz de usuario
  updateAuthUI();
  
  // Mostrar mensaje de éxito
  showAlert('Sesión cerrada correctamente', 'success');
  
  // Redirigir a la página principal
  window.location.href = '/';
}

// Función para cargar los perfumes en la página principal
async function loadPerfumes() {
  const container = document.getElementById('perfumes-container');
  if (!container) return;
  
  try {
    const response = await fetch('/api/perfumes');
    const perfumes = await response.json();
    
    if (perfumes.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
          <p>No hay perfumes disponibles en este momento.</p>
        </div>
      `;
      return;
    }
    
    // Crear el grid de perfumes
    const perfumesGrid = document.createElement('div');
    perfumesGrid.className = 'perfumes-grid';
    
    // Agregar cada perfume al grid
    perfumes.forEach(perfume => {
      const perfumeCard = document.createElement('div');
      perfumeCard.className = 'perfume-card';
      
      perfumeCard.innerHTML = `
        <div class="perfume-image">
          <img src="${perfume.imagen ? `/uploads/${perfume.imagen}` : '/img/perfume-placeholder.jpg'}" alt="${perfume.nombre}">
        </div>
        <div class="perfume-info">
          <h3 class="perfume-name">${perfume.nombre}</h3>
          <p class="perfume-brand">${perfume.marca}</p>
          <p class="perfume-description">${perfume.descripcion ? (perfume.descripcion.substring(0, 100) + (perfume.descripcion.length > 100 ? '...' : '')) : 'Sin descripción'}</p>
          <div class="perfume-meta">
            <span class="perfume-price">$${typeof perfume.precio === 'number' ? perfume.precio.toFixed(2) : perfume.precio}</span>
            <span class="perfume-type">${perfume.tipo}</span>
          </div>
        </div>
      `;
      
      // Agregar evento de clic para mostrar los detalles del perfume
      perfumeCard.addEventListener('click', () => {
        showPerfumeDetails(perfume);
      });
      
      perfumesGrid.appendChild(perfumeCard);
    });
    
    // Limpiar el contenedor y agregar el grid
    container.innerHTML = '';
    container.appendChild(perfumesGrid);
  } catch (error) {
    console.error('Error al cargar perfumes:', error);
    container.innerHTML = `
      <div style="text-align: center; padding: 2rem;">
        <p>Error al cargar los perfumes. Por favor, intenta de nuevo más tarde.</p>
      </div>
    `;
  }
}

// Función para mostrar los detalles del perfume
function showPerfumeDetails(perfume) {
  // Crear el modal de detalles
  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'perfume-detail-modal';
  
  // Obtener el número de WhatsApp real
  const whatsappNumber = '34645131103';
  const whatsappMessage = encodeURIComponent(`Hola, estoy interesado/a en el perfume ${perfume.nombre} de ${perfume.marca}. ¿Podrías darme más información?`);
  
  // Obtener los usuarios de Instagram reales
  const instagramUser1 = 'alex.colodrero';
  const instagramUser2 = 'joseosunah';
  const email = 'perfumesarabesae@gmail.com';
  
  modalOverlay.innerHTML = `
    <div class="perfume-detail-content">
      <div class="perfume-detail-header">
        <h2>${perfume.nombre}</h2>
        <button class="perfume-detail-close">&times;</button>
      </div>
      <div class="perfume-detail-body">
        <div class="perfume-detail-image">
          <img src="${perfume.imagen ? `/uploads/${perfume.imagen}` : '/img/perfume-placeholder.jpg'}" alt="${perfume.nombre}">
        </div>
        <div class="perfume-detail-info">
          <h3 class="perfume-detail-title">${perfume.nombre}</h3>
          <p class="perfume-detail-brand">${perfume.marca}</p>
          <p class="perfume-detail-description">${perfume.descripcion}</p>
          <div class="perfume-detail-meta">
            <div class="perfume-detail-meta-item">
              <span class="perfume-detail-meta-label">Tipo</span>
              <span class="perfume-detail-meta-value">${perfume.tipo}</span>
            </div>
            <div class="perfume-detail-meta-item">
              <span class="perfume-detail-meta-label">Stock</span>
              <span class="perfume-detail-meta-value">${perfume.stock} unidades</span>
            </div>
          </div>
          <div class="perfume-detail-price">$${typeof perfume.precio === 'number' ? perfume.precio.toFixed(2) : perfume.precio}</div>
          <div class="perfume-detail-actions">
            <a href="https://wa.me/${whatsappNumber}?text=${whatsappMessage}" target="_blank" class="whatsapp-btn">
              <i class="fab fa-whatsapp"></i> Consultar por WhatsApp
            </a>
            <a href="https://instagram.com/${instagramUser1}" target="_blank" class="instagram-btn">
              <i class="fab fa-instagram"></i> @${instagramUser1}
            </a>
            <a href="https://instagram.com/${instagramUser2}" target="_blank" class="instagram-btn">
              <i class="fab fa-instagram"></i> @${instagramUser2}
            </a>
            <a href="mailto:${email}" class="email-btn">
              <i class="far fa-envelope"></i> Contactar por Email
            </a>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Agregar el modal al body
  document.body.appendChild(modalOverlay);
  
  // Agregar evento para cerrar el modal
  const closeButton = modalOverlay.querySelector('.perfume-detail-close');
  closeButton.addEventListener('click', () => {
    modalOverlay.remove();
  });
  
  // Cerrar el modal al hacer clic fuera del contenido
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      modalOverlay.remove();
    }
  });
}

// Función para cargar los perfumes en el panel de administración
async function loadPerfumesAdmin() {
  const perfumesTableBody = document.getElementById('perfumes-table-body');
  if (!perfumesTableBody) return;
  
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/';
      return;
    }
    
    const response = await fetch('/api/perfumes', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const perfumes = await response.json();
    
    if (!response.ok) {
      throw new Error('Error al cargar los perfumes');
    }
    
    if (perfumes.length === 0) {
      perfumesTableBody.innerHTML = '<tr><td colspan="7" class="text-center">No hay perfumes disponibles.</td></tr>';
      return;
    }
    
    const perfumesHTML = perfumes.map(perfume => `
      <tr class="perfume-row" data-id="${perfume.id}">
        <td class="perfume-id">#${perfume.id}</td>
        <td class="perfume-name">
          <div class="perfume-name-container">
            <div class="perfume-img-small">
              <img src="${perfume.imagen ? `/uploads/${perfume.imagen}` : '/img/perfume-placeholder.jpg'}" alt="${perfume.nombre}">
            </div>
            <div class="perfume-info-cell">
              <span class="perfume-title">${perfume.nombre}</span>
              <span class="perfume-brand">${perfume.marca}</span>
            </div>
          </div>
        </td>
        <td class="perfume-price">$${typeof perfume.precio === 'number' ? perfume.precio.toFixed(2) : perfume.precio}</td>
        <td class="perfume-stock">
          <div class="stock-indicator ${parseInt(perfume.stock) > 10 ? 'high-stock' : parseInt(perfume.stock) > 0 ? 'medium-stock' : 'no-stock'}">
            <div class="stock-dot"></div>
            <div class="stock-info">
              <span class="stock-number">${perfume.stock}</span>
              <span class="stock-text">${parseInt(perfume.stock) > 10 ? 'Disponible' : parseInt(perfume.stock) > 0 ? 'Limitado' : 'Agotado'}</span>
            </div>
          </div>
        </td>
        <td class="perfume-status">
          <span class="status-badge ${perfume.activo ? 'status-active' : 'status-inactive'}">
            <i class="fas ${perfume.activo ? 'fa-check-circle' : 'fa-times-circle'}"></i>
            <span>${perfume.activo ? 'Activo' : 'Inactivo'}</span>
          </span>
        </td>
        <td class="action-buttons">
          <div class="action-btn-container">
            <button class="action-btn edit-btn" onclick="editPerfume(${perfume.id})" title="Editar perfume">
              <i class="fas fa-edit"></i>
            </button>
            <button class="action-btn delete-btn" onclick="deletePerfume(${perfume.id})" title="Eliminar perfume">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
    
    perfumesTableBody.innerHTML = perfumesHTML;
    
    // Agregar estilos para la tabla de perfumes en el panel de administración
    const style = document.createElement('style');
    style.textContent = `
      /* Estilos para la tabla de perfumes */
      .perfume-row {
        transition: all 0.3s ease;
        border-bottom: 1px solid rgba(0,0,0,0.05);
      }
      
      .perfume-row:hover {
        background-color: rgba(212, 165, 116, 0.05);
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.05);
      }
      
      .perfume-row td {
        padding: 1rem 0.75rem;
        vertical-align: middle;
      }
      
      .perfume-id {
        font-weight: 600;
        color: #888;
        font-size: 0.9rem;
        letter-spacing: 0.5px;
      }
      
      .perfume-name-container {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      
      .perfume-img-small {
        width: 48px;
        height: 48px;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        flex-shrink: 0;
      }
      
      .perfume-img-small img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .perfume-info-cell {
        display: flex;
        flex-direction: column;
      }
      
      .perfume-title {
        font-weight: 600;
        color: var(--text);
        margin-bottom: 4px;
        font-size: 1rem;
      }
      
      .perfume-brand {
        font-size: 0.85rem;
        color: var(--accent);
        font-weight: 500;
      }
      
      .perfume-price {
        font-weight: 700;
        color: var(--accent);
        font-size: 1.05rem;
      }
      
      /* Indicador de stock */
      .stock-indicator {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .stock-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        flex-shrink: 0;
      }
      
      .high-stock .stock-dot {
        background-color: #4CAF50;
        box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
      }
      
      .medium-stock .stock-dot {
        background-color: #FFC107;
        box-shadow: 0 0 0 2px rgba(255, 193, 7, 0.2);
      }
      
      .no-stock .stock-dot {
        background-color: #F44336;
        box-shadow: 0 0 0 2px rgba(244, 67, 54, 0.2);
      }
      
      .stock-info {
        display: flex;
        flex-direction: column;
      }
      
      .stock-number {
        font-weight: 700;
        font-size: 0.95rem;
        color: var(--text);
      }
      
      .stock-text {
        font-size: 0.8rem;
        color: #777;
      }
      
      /* Estilos para los badges de estado */
      .status-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        border-radius: 50px;
        font-size: 0.85rem;
        font-weight: 600;
        transition: all 0.3s ease;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        min-width: 80px;
      }
      
      .status-badge:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
      }
      
      .status-active {
        background-color: rgba(76, 175, 80, 0.15);
        color: #2E7D32;
        border: 1px solid rgba(76, 175, 80, 0.3);
      }
      
      .status-inactive {
        background-color: rgba(244, 67, 54, 0.15);
        color: #C62828;
        border: 1px solid rgba(244, 67, 54, 0.3);
      }
      
      .status-badge i {
        font-size: 1rem;
      }
      
      /* Estilos para los botones de acción */
      .action-buttons {
        text-align: center;
      }
      
      .action-btn-container {
        display: flex;
        gap: 8px;
        justify-content: center;
      }
      
      .action-btn {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
        cursor: pointer;
        transition: all 0.3s ease;
        color: white;
        font-size: 0.9rem;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      
      .action-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.15);
      }
      
      .edit-btn {
        background-color: #2196F3;
      }
      
      .edit-btn:hover {
        background-color: #1976D2;
      }
      
      .delete-btn {
        background-color: #F44336;
      }
      
      .delete-btn:hover {
        background-color: #D32F2F;
      }
      
      /* Estilos responsivos */
      @media (max-width: 992px) {
        .perfume-img-small {
          width: 40px;
          height: 40px;
        }
        
        .perfume-title {
          font-size: 0.95rem;
        }
      }
      
      @media (max-width: 768px) {
        .perfume-row td {
          padding: 0.75rem 0.5rem;
        }
        
        .perfume-name-container {
          gap: 8px;
        }
        
        .perfume-img-small {
          width: 36px;
          height: 36px;
        }
        
        .status-badge {
          padding: 4px 8px;
          font-size: 0.8rem;
        }
        
        .action-btn {
          width: 32px;
          height: 32px;
          font-size: 0.8rem;
        }
      }
    `;
    
    // Agregar el estilo al documento
    document.head.appendChild(style);
  } catch (error) {
    const alertContainer = document.getElementById('alert-container');
    if (alertContainer) {
      alertContainer.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
    }
  }
}

// Función para crear un nuevo perfume
async function createPerfume(e) {
  e.preventDefault();
  
  const form = document.getElementById('perfume-form');
  const formData = new FormData(form);
  
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/';
      return;
    }
    
    const response = await fetch('/api/perfumes', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Error al crear el perfume');
    }
    
    showAlert('Perfume creado exitosamente', 'success');
    form.reset();
    
    // Recargar la lista de perfumes
    loadPerfumesAdmin();
  } catch (error) {
    showAlert(error.message, 'danger');
  }
}

// Función para editar un perfume
async function editPerfume(id) {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/';
      return;
    }
    
    const response = await fetch(`/api/perfumes/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const perfume = await response.json();
    
    if (!response.ok) {
      throw new Error('Error al cargar el perfume');
    }
    
    // Crear modal de edición
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.id = 'edit-modal';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    
    modalContent.innerHTML = `
      <div class="modal-header">
        <h3 class="modal-title">Editar Perfume</h3>
        <button class="modal-close" onclick="closeEditModal()">&times;</button>
      </div>
      <div id="edit-alert-container"></div>
      <form id="edit-form">
        <input type="hidden" name="id" value="${perfume.id}">
        <div class="form-group">
          <label for="nombre" class="form-label">Nombre</label>
          <input type="text" id="nombre" name="nombre" class="form-input" value="${perfume.nombre}" required>
        </div>
        <div class="form-group">
          <label for="marca" class="form-label">Marca</label>
          <input type="text" id="marca" name="marca" class="form-input" value="${perfume.marca}" required>
        </div>
        <div class="form-group">
          <label for="descripcion" class="form-label">Descripción</label>
          <textarea id="descripcion" name="descripcion" class="form-textarea">${perfume.descripcion || ''}</textarea>
        </div>
        <div class="form-group">
          <label for="precio" class="form-label">Precio (€)</label>
          <input type="number" id="precio" name="precio" step="0.01" class="form-input" value="${perfume.precio}" required>
        </div>
        <div class="form-group">
          <label for="tipo" class="form-label">Tipo</label>
          <select id="tipo" name="tipo" class="form-select" required>
            <option value="Eau de Parfum" ${perfume.tipo === 'Eau de Parfum' ? 'selected' : ''}>Eau de Parfum</option>
            <option value="Eau de Toilette" ${perfume.tipo === 'Eau de Toilette' ? 'selected' : ''}>Eau de Toilette</option>
            <option value="Parfum" ${perfume.tipo === 'Parfum' ? 'selected' : ''}>Parfum</option>
            <option value="Eau Fraiche" ${perfume.tipo === 'Eau Fraiche' ? 'selected' : ''}>Eau Fraiche</option>
            <option value="Cologne" ${perfume.tipo === 'Cologne' ? 'selected' : ''}>Cologne</option>
          </select>
        </div>
        <div class="form-group">
          <label for="genero" class="form-label">Género</label>
          <select id="genero" name="genero" class="form-select" required>
            <option value="Masculino" ${perfume.genero === 'Masculino' ? 'selected' : ''}>Masculino</option>
            <option value="Femenino" ${perfume.genero === 'Femenino' ? 'selected' : ''}>Femenino</option>
            <option value="Unisex" ${perfume.genero === 'Unisex' ? 'selected' : ''}>Unisex</option>
          </select>
        </div>
        <div class="form-group">
          <label for="tamano" class="form-label">Tamaño</label>
          <input type="text" id="tamano" name="tamano" class="form-input" value="${perfume.tamano}">
        </div>
        <div class="form-group">
          <label for="stock" class="form-label">Stock</label>
          <input type="number" id="stock" name="stock" class="form-input" value="${perfume.stock}" required>
        </div>
        <div class="form-group">
          <label for="activo" class="form-label">Estado</label>
          <select id="activo" name="activo" class="form-select" required>
            <option value="1" ${perfume.activo == 1 ? 'selected' : ''}>Activo</option>
            <option value="0" ${perfume.activo == 0 ? 'selected' : ''}>Inactivo</option>
          </select>
        </div>
        <div class="form-group">
          <label for="imagen" class="form-label">Imagen (dejar en blanco para mantener la actual)</label>
          <input type="file" id="imagen" name="imagen" class="form-input">
          ${perfume.imagen ? `<p class="mt-2">Imagen actual: ${perfume.imagen}</p>` : ''}
        </div>
        <button type="submit" class="btn btn-primary btn-block">Actualizar Perfume</button>
      </form>
    `;
    
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);
    
    // Prevenir que el click en el contenido cierre el modal
    modalContent.addEventListener('click', (e) => {
      e.stopPropagation();
    });
    
    // Cerrar el modal al hacer click fuera del contenido
    modalOverlay.addEventListener('click', () => {
      closeEditModal();
    });
    
    // Manejar el envío del formulario de edición
    const editForm = document.getElementById('edit-form');
    editForm.addEventListener('submit', updatePerfume);
  } catch (error) {
    showAlert(error.message, 'danger');
  }
}

// Función para cerrar el modal de edición
function closeEditModal() {
  const modal = document.getElementById('edit-modal');
  if (modal) {
    modal.remove();
  }
}

// Función para actualizar un perfume
async function updatePerfume(e) {
  e.preventDefault();
  
  const form = document.getElementById('edit-form');
  const formData = new FormData(form);
  const id = formData.get('id');
  
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/';
      return;
    }
    
    const response = await fetch(`/api/perfumes/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Error al actualizar el perfume');
    }
    
    showAlert('Perfume actualizado exitosamente', 'success');
    closeEditModal();
    
    // Recargar la lista de perfumes
    loadPerfumesAdmin();
  } catch (error) {
    const alertContainer = document.getElementById('edit-alert-container');
    if (alertContainer) {
      alertContainer.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
    }
  }
}

// Función para eliminar un perfume
async function deletePerfume(id) {
  if (!confirm('¿Estás seguro de que deseas eliminar este perfume permanentemente de la base de datos? Esta acción no se puede deshacer.')) {
    return;
  }
  
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/';
      return;
    }
    
    const response = await fetch(`/api/perfumes/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Error al eliminar el perfume');
    }
    
    showAlert(data.message || 'Perfume eliminado permanentemente', 'success');
    
    // Recargar la lista de perfumes
    loadPerfumesAdmin();
  } catch (error) {
    showAlert(error.message, 'danger');
  }
}

// Función para actualizar la interfaz según el estado de autenticación
function updateAuthUI() {
  const isLoggedIn = isAuthenticated();
  const loginButton = document.getElementById('login-button');
  const adminLinks = document.getElementById('admin-links');
  const adminLinkFooter = document.getElementById('admin-link-footer');
  
  if (isLoggedIn) {
    // Usuario autenticado: mostrar enlaces de admin y ocultar botón de login
    if (loginButton) loginButton.style.display = 'none';
    if (adminLinks) adminLinks.style.display = 'flex';
    if (adminLinkFooter) adminLinkFooter.style.display = 'block';
  } else {
    // Usuario no autenticado: mostrar botón de login y ocultar enlaces de admin
    if (loginButton) loginButton.style.display = 'block';
    if (adminLinks) adminLinks.style.display = 'none';
    if (adminLinkFooter) adminLinkFooter.style.display = 'none';
  }
}

// Función para filtrar perfumes en la tabla de administración
function filterPerfumes() {
  const searchInput = document.getElementById('search-perfumes');
  if (!searchInput) return;
  
  const filterValue = searchInput.value.toLowerCase();
  const perfumeRows = document.querySelectorAll('.perfume-row');
  
  perfumeRows.forEach(row => {
    const id = row.querySelector('.perfume-id').textContent.toLowerCase();
    const name = row.querySelector('.perfume-title').textContent.toLowerCase();
    const brand = row.querySelector('.perfume-brand').textContent.toLowerCase();
    const price = row.querySelector('.perfume-price').textContent.toLowerCase();
    
    // Verificar si alguno de los campos contiene el texto de búsqueda
    if (id.includes(filterValue) || 
        name.includes(filterValue) || 
        brand.includes(filterValue) || 
        price.includes(filterValue)) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
}

// Inicializar la página
document.addEventListener('DOMContentLoaded', () => {
  // Verificar autenticación para páginas de administración
  checkAdminAuth();
  
  // Actualizar la interfaz según el estado de autenticación
  updateAuthUI();
  
  // Verificar si estamos en la página principal
  if (document.getElementById('perfumes-container')) {
    loadPerfumes();
  }
  
  // Verificar si estamos en el panel de administración
  if (document.getElementById('perfumes-table-body')) {
    loadPerfumesAdmin();
    
    // Configurar el buscador de perfumes
    const searchInput = document.getElementById('search-perfumes');
    if (searchInput) {
      searchInput.addEventListener('keyup', filterPerfumes);
    }
  }
  
  // Verificar si existe el formulario de creación de perfumes
  const perfumeForm = document.getElementById('perfume-form');
  if (perfumeForm) {
    perfumeForm.addEventListener('submit', createPerfume);
  }
  
  // Configurar el botón de login
  const loginButton = document.getElementById('login-button');
  if (loginButton) {
    loginButton.addEventListener('click', showLoginModal);
  }
  
  // Configurar el botón de logout
  const logoutButton = document.getElementById('logout-button');
  if (logoutButton) {
    logoutButton.addEventListener('click', logout);
  }
});