class RecipeBuilder{
	constructor(){
		this.recipes = {};
	}

	// Simple template replacement function
	replaceTemplate(template, values) {
		return template.replace(/\{(\w+)\}/g, (match, key) => {
			return values[key] !== undefined ? values[key] : match;
		});
	}

	resolveRecipe(recipes, recipeName) {
		const recipe = recipes[recipeName];
	
		// No inheritance - return as-is
		if (!recipe.extends) {
			return recipe;
		}
		
		const base = recipes[recipe.extends];
		
		// Resolve ingredients using spread operator
		let ingredients = { ...base.ingredients };
		if (recipe.ingredients?.remove) {
			for (const key in recipe.ingredients.remove) delete ingredients[key];
		}
		ingredients = {
			...ingredients,
			...recipe.ingredients?.add,
			...recipe.ingredients?.replace
		};
		
		// Resolve steps - handle add differently
		let steps = { ...base.steps };
		if (recipe.steps?.remove) {
			for (const key in recipe.steps.remove) delete steps[key];
		}

			// Apply replacements after additions
		steps = {
			...steps,
			...recipe.steps?.replace
		};
		
		// Handle step additions (insert before, shifting subsequent steps)
		if (recipe.steps?.add) {
			const newSteps = {};
			const additions = recipe.steps.add;
			const additionKeys = Object.keys(additions).map(Number).sort((a, b) => a - b);
			
			// Process all steps, shifting as needed
			for (const key in steps) {
			const stepNum = Number(key);
			// Count how many additions should come before this step
			const shiftsNeeded = additionKeys.filter(addKey => addKey <= stepNum).length;
			newSteps[stepNum + shiftsNeeded] = steps[key];
			}
			
			// Add the new steps at their positions
			for (const key in additions) {
			newSteps[key] = additions[key];
			}
			
			steps = newSteps;
		}
	
		// Merge everything, excluding operation properties
		const { extends: _, ingredients: __, steps: ___, ...childProps } = recipe;
		
		const result = {
			...base,
			...childProps,
			ingredients,
			steps
		};
		
		// Replace template variables in steps
		for (const key in result.steps) {
			result.steps[key] = this.replaceTemplate(result.steps[key], result);
		}

		return result;
	}

	buildRecipe(recipeID){
		const recipe = this.recipes[recipeID];
		const ingredientsList = Object.entries(recipe.ingredients).map(i => ({name: i[0], value: i[1]}));
		
		const stepsList = Object.entries(recipe.steps)
			.sort(([a], [b]) => Number(a) - Number(b))
			.map(s => ({index: s[0], value: s[1]}));
		
		return `
			<h1>${recipe.name}</h1>
			${recipe.desc ? `<p>${recipe.desc}</p>` : ''}
			
			<h2>Ingredients</h2>
			<ul>
			${ingredientsList.map((ingredient) =>{
				return `<li>${snakeToDisplay(ingredient.name)}: ${ingredient.value}</li>`
			}).join("")}
			</ul>
			
			<h2>Steps</h2>
			<ol>
			${stepsList.map((step) =>{
				return `<li>${step.value}</li>`
			}).join("")}
			</ol>

			${recipe.notes ? `<h2>Notes</h2><p>${recipe.notes}</p>` : ''}
			
			<button id="closeBtn">Close</button>
		`
	}



	const 


}