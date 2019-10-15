document.addEventListener('DOMContentLoaded', function(event) {

  const actionBtns = [
    { deleteRecipe: {
      selector: '.delete-recipe',
      action: ''
    } }
  ];
  const deleteRecepeBtns = document.querySelectorAll('.delete-recipe');
  const editRecipeBtn = document.querySelector('.edit-recipe');

  deleteRecepeBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      const url = '/delete/'+id;

      if (confirm('Delete Recipe?')) {
        sendDelete(url);
      }
    });
  });

  async function sendDelete(url) {
    await fetch(url, { method: 'DELETE' });
  }
});