document.addEventListener('DOMContentLoaded', function() {

  const actionBtns = [
    { name: 'Delete Recipe',
      method: 'DELETE',
      url: '/delete/',
      btnSelector: '.delete-recipe',
      confirmMsg: 'Delete Recipe?',
      op: 'delete',
    }, {
      name: 'Update Recipe',
      method: 'PUT',
      url: '/put/',
      btnSelector: '.update-recipe',
      confirmMsg: null,
      op: 'update'
    }, {
      name: 'Edit Recipe',
      method: null,
      url: null,
      btnSelector: '.edit-recipe',
      confirmMsg: null,
      op: 'edit'
    }
  ];

  actionBtns.forEach(action => {
    const btns = document.querySelectorAll(action.btnSelector);

    if(!btns) return;
    btns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const item = e.currentTarget;
        const id = item.getAttribute('data-id');
        const op = action.op;
        const method = action.method;
        const url = action.url ? action.url+id : null;
        const confirmMsg = action.confirmMsg;

        console.log(id);
        console.log(op);

        switch (op) {
        case 'delete':
          if(confirmMsg) {
            if (confirm(confirmMsg)) sendRequest(url, method);
          }
          break;
        case 'update':
          sendRequest(url, method);
          break;
        case 'edit':
          document.getElementById('editId').value = item.getAttribute('data-id');
          document.getElementById('editTitle').value = item.getAttribute('data-title');
          document.getElementById('editIngredients').value = item.getAttribute('data-ingredients');
          document.getElementById('editDirections').value = item.getAttribute('data-directions');
        }
      });
    });
  });

  async function sendRequest(url, method) {
    await fetch(url, { method });
    location.href = '/';
  }
});