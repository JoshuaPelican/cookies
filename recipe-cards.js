const recipeContainer = document.getElementById("recipes");

function displayRecipes(recipes){
    recipes.forEach(recipe => {
        recipeContainer.appendChild(createRecipeCard(recipe))         
    });
}

function createRecipeCard(recipe) {
  const template = document.querySelector('#recipe-card-template');
  const card = template.content.cloneNode(true);
  
  card.querySelector('.recipe-name').textContent = recipe.info.name;
  card.querySelector('.recipe-desc').textContent = recipe.info.desc;
  card.querySelector('.recipe-yield').textContent = `Yield: ${recipe.info.yield}`;
  
  return card;
}

loadAllRecipes().then(recipes => displayRecipes(recipes))
