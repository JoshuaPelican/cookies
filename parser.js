class RecipeParser {
  constructor() {
    this.ingredients = null;
    this.recipes = {};
    this.recipeCache = new Map();
  }

  async initialize() {
    const ingredientsResponse = await fetch('ingredients.yaml');
    const ingredientsText = await ingredientsResponse.text();
    this.ingredients = jsyaml.load(ingredientsText);
  }

  async loadRecipe(recipeName) {
    if (this.recipes[recipeName]) {
      return this.recipes[recipeName];
    }

    const response = await fetch(`recipes/${recipeName}.yaml`);
    const text = await response.text();
    const recipe = jsyaml.load(text);
    this.recipes[recipeName] = recipe;
    return recipe;
  }

  parseIngredientValue(key, value, defaultUnit) {
    if (typeof value === 'number') {
      return {
        id: key,
        amount: value,
        unit: defaultUnit
      };
    }

    if (typeof value === 'string') {
      const match = value.match(/^([\d.]+)\s*(.+)$/);
      if (match) {
        return {
          id: key,
          amount: parseFloat(match[1]),
          unit: match[2].trim()
        };
      }
    }

    throw new Error(`Invalid ingredient value for ${key}: ${value}`);
  }

  parseRecipeStep(stepData) {
    const parsed = {
      instructions: stepData.instructions || '',
      ingredients: []
    };

    if (stepData.ingredients && Array.isArray(stepData.ingredients)) {
      for (const item of stepData.ingredients) {
        if (typeof item === 'object') {
          for (const [key, value] of Object.entries(item)) {
            const ingredientDef = this.ingredients[key];
            if (!ingredientDef) {
              console.error(`Unknown ingredient: ${key}`);
              continue;
            }

            const parsedIng = this.parseIngredientValue(
              key,
              value,
              ingredientDef.unit
            );

            parsed.ingredients.push({
              ...parsedIng,
              name: ingredientDef.name,
              category: ingredientDef.category,
              prep: ingredientDef.prep
            });
          }
        }
      }
    }

    return parsed;
  }

  async resolveRecipe(recipeName) {
    if (this.recipeCache.has(recipeName)) {
      return this.recipeCache.get(recipeName);
    }

    const recipe = await this.loadRecipe(recipeName);
    
    let baseRecipe = {};
    if (recipe.extends) {
      baseRecipe = await this.resolveRecipe(recipe.extends);
    }

    const resolved = {
      name: recipe.name,
      yield: recipe.yield || baseRecipe.yield,
      temp: recipe.temp || baseRecipe.temp,
      time: recipe.time || baseRecipe.time,
      steps: {}
    };

    if (baseRecipe.steps) {
      resolved.steps = JSON.parse(JSON.stringify(baseRecipe.steps));
    }

    if (recipe.recipe) {
      for (const [stepName, stepData] of Object.entries(recipe.recipe)) {
        const parsedStep = this.parseRecipeStep(stepData);
        
        if (resolved.steps[stepName]) {
          // Merge with existing step
          const existingIngredients = resolved.steps[stepName].ingredients || [];
          const newIngredients = parsedStep.ingredients || [];
          
          const ingredientMap = new Map();
          existingIngredients.forEach(ing => {
            ingredientMap.set(ing.id, ing);
          });
          
          newIngredients.forEach(ing => {
            ingredientMap.set(ing.id, ing);
          });
          
          resolved.steps[stepName].ingredients = Array.from(ingredientMap.values());
          
          if (parsedStep.instructions) {
            resolved.steps[stepName].instructions = parsedStep.instructions;
          }
        } else {
          resolved.steps[stepName] = parsedStep;
        }
      }
    }

    for (const [stepName, stepData] of Object.entries(resolved.steps)) {
      stepData.instructions = this.processInstructions(
        stepData.instructions,
        stepData.ingredients,
        resolved
      );
    }

    this.recipeCache.set(recipeName, resolved);
    return resolved;
  }

  processInstructions(instructions, ingredients, recipe) {
    let processed = instructions;

    if (ingredients) {
      ingredients.forEach(ing => {
        const formatted = this.formatIngredient(ing);
        processed = processed.replace(
          new RegExp(`\\{${ing.id}\\}`, 'g'),
          formatted
        );
      });
    }

    processed = processed.replace(/\{temp\}/g, recipe.temp);
    processed = processed.replace(/\{time\}/g, recipe.time);

    return processed;
  }

  formatIngredient(ing) {
    let formatted = ing.name;
    if (ing.prep) {
      formatted = `${ing.prep} ${formatted}`;
    }
    return formatted;
  }

  formatIngredientWithAmount(ing) {
    let amount = ing.amount;
    
    const fractions = {
      0.25: '¼',
      0.33: '⅓',
      0.5: '½',
      0.66: '⅔',
      0.75: '¾'
    };

    const whole = Math.floor(amount);
    const decimal = amount - whole;
    
    let amountStr = '';
    if (whole > 0) amountStr += whole;
    if (decimal > 0) {
      const fraction = fractions[Math.round(decimal * 100) / 100];
      if (fraction) {
        amountStr += (whole > 0 ? ' ' : '') + fraction;
      } else {
        amountStr = amount.toString();
      }
    }

    let formatted = `${amountStr} ${ing.unit}`;
    if (ing.unit !== 'whole') formatted += ' ';
    formatted += ing.name;
    
    if (ing.prep) {
      formatted += `, ${ing.prep}`;
    }
    
    return formatted;
  }

  async generateRecipe(recipeName) {
    const recipe = await this.resolveRecipe(recipeName);
    
    const allIngredients = [];
    const ingredientsSeen = new Set();
    
    for (const step of Object.values(recipe.steps)) {
      if (step.ingredients) {
        step.ingredients.forEach(ing => {
          if (!ingredientsSeen.has(ing.id)) {
            allIngredients.push(ing);
            ingredientsSeen.add(ing.id);
          }
        });
      }
    }

    return {
      name: recipe.name,
      yield: recipe.yield,
      bakeTemp: recipe.temp,
      bakeTime: recipe.time,
      ingredients: allIngredients.map(ing => this.formatIngredientWithAmount(ing)),
      steps: Object.entries(recipe.steps).map(([name, data]) => ({
        name: name,
        instructions: data.instructions
      }))
    };
  }
}