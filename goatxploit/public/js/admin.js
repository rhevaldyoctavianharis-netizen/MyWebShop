document.addEventListener('DOMContentLoaded', () => {
  const button = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('adminSidebar');
  if (button && sidebar) {
    button.addEventListener('click', () => {
      sidebar.classList.toggle('hidden');
    });
  }
});
