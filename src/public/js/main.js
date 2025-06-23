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
  const perfumesContainer = document.getElementById('perfumes-container');
  if (!perfumesContainer) return;
  
  try {
    const response = await fetch('/api/perfumes');
    const perfumes = await response.json();
    
    if (!response.ok) {
      throw new Error('Error al cargar los perfumes');
    }
    
    if (perfumes.length === 0) {
      perfumesContainer.innerHTML = '<p class="text-center">No hay perfumes disponibles en este momento.</p>';
      return;
    }
    
    const perfumesHTML = perfumes.map(perfume => `
      <div class="perfume-card">
        <div class="perfume-image">
          ${perfume.imagen ? 
            `<img src="/uploads/${perfume.imagen}" alt="${perfume.nombre}">` : 
            `<span>Sin imagen</span>`
          }
        </div>
        <div class="perfume-info">
          <h3 class="perfume-name">${perfume.nombre}</h3>
          <p class="perfume-brand">${perfume.marca}</p>
          <p class="perfume-description">${perfume.descripcion || 'Sin descripción'}</p>
          <div class="perfume-details">
            <span class="perfume-price">${perfume.precio}€</span>
            <span class="perfume-type">${perfume.tipo}</span>
          </div>
        </div>
      </div>
    `).join('');
    
    perfumesContainer.innerHTML = `<div class="perfumes-grid">${perfumesHTML}</div>`;
  } catch (error) {
    perfumesContainer.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
  }
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
      <tr>
        <td>${perfume.id}</td>
        <td>${perfume.nombre}</td>
        <td>${perfume.marca}</td>
        <td>${perfume.precio}€</td>
        <td>${perfume.stock}</td>
        <td>${perfume.activo ? 'Activo' : 'Inactivo'}</td>
        <td>
          <button class="btn btn-secondary btn-sm" onclick="editPerfume(${perfume.id})">Editar</button>
          <button class="btn btn-danger btn-sm" onclick="deletePerfume(${perfume.id})">Eliminar</button>
        </td>
      </tr>
    `).join('');
    
    perfumesTableBody.innerHTML = perfumesHTML;
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