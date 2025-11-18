class App{
    constructor(){
        this.history = new HistoryManager();
        this.cookies = new CookieManager();
        this.recipeBuilder = new RecipeBuilder();

        this.cookieContainer = document.getElementById("cookieBox");
        this.cookieNameTip = document.getElementById("cookieNameTip");

        this.recipeDisplay = document.getElementById("recipeDisplay");
        this.init();
    }

    init(){
        this.history
            .register('/', () => this.displayHome())
            .register('/recipe', (data) => this.displayRecipe(data.params.id));

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.history.back();
            }
        });

        Promise.all(
            recipeList.map(async recipeID => {
                const recipeObj = await parseYamlFile(`recipes/${recipeID}.yaml`);
                this.recipeBuilder.recipes[recipeID] = recipeObj;
            })
            ).then(() =>{
                recipeList.map(recipeID =>{
                    this.recipeBuilder.recipes[recipeID] = this.recipeBuilder.resolveRecipe(this.recipeBuilder.recipes, recipeID)
                });
                this.initializeCookies(this.recipeBuilder.recipeList);
                this.history.init();
            }
        );
    }

    initializeCookies(){
        const recipeKeys = recipeList.slice(0);
        
        // Create cookie elements for each recipe
        for (let i = 1; i < recipeKeys.length; i++) {
            const cookie = this.cookies.buildCookie(recipeKeys[i]);
            this.cookieContainer.appendChild(cookie);

            cookie.addEventListener("click", (e) => {
                if (this.activeCookie) return;
                this.activeCookie = e.target;
                
                var rect = this.activeCookie.getBoundingClientRect();
                
                // Switch to fixed positioning at current visual location
                this.activeCookie.style.position = 'fixed';
                this.activeCookie.style.left = rect.left + 35 + 'px'; // magic ugly number
                this.activeCookie.style.top = rect.top + 70 + 'px'; // another magic number
                this.activeCookie.style.margin = '0';
                
                // Force reflow to apply position change before animating
                void this.activeCookie.offsetHeight;
                
                const viewportCenterX = window.innerWidth / 2;
                const viewportCenterY = window.innerHeight / 2;
                
                rect = this.activeCookie.getBoundingClientRect();

                // Calculate translation to center
                const translateX = viewportCenterX - (rect.left + 100);
                const translateY = viewportCenterY - (rect.top + 100);
                
                // Calculate scale to fill viewport
                const diagonal = Math.sqrt((window.innerWidth ** 2) + (window.innerHeight ** 2));
                const scale = diagonal / 180; // 180 is slightly smaller than cookie width
                
                this.activeCookie.style.transition = "transform 0.8s ease-out";
                this.activeCookie.style.transform = `translate(${translateX-35}px, ${translateY-70}px) scale(${scale})`;
                
                this.activeCookie.classList.add("zooming");
                this.cookieNameTip.classList.add("hidden");
                
                setTimeout(() => {
                    this.history.navigate(`/recipe?id=${this.activeCookie.dataset.cookieID}`);
                    this.recipeDisplay.classList.remove('hidden');
                }, 500);
            });

            if(!window.matchMedia("(max-width: 768px)").matches){
                cookie.addEventListener("mouseenter", (e) => {
                    this.cookieNameTip.classList.remove("hidden");
                    const rect = e.target.getBoundingClientRect();
                    const cookieCenterX = rect.left + (rect.width / 2);
                    const cookieCenterY = rect.top + (rect.height / 2);

                    this.cookieNameTip.innerText = this.recipeBuilder.recipes[e.target.dataset.cookieID].name;

                    this.cookieNameTip.style.left = (cookieCenterX - (this.cookieNameTip.getBoundingClientRect().width / 2)) + 'px';
                    this.cookieNameTip.style.top = (this.cookieContainer.getBoundingClientRect().top + 200) + 'px'; // same 180
                });

                cookie.addEventListener("mouseleave", (e) => {
                    this.cookieNameTip.classList.add("hidden");
                });
            }
        }
            
    }

    displayHome(){
        if(this.activeCookie)
            this.closeRecipe();
    }

    displayRecipe(recipeID) {
        if(!this.activeCookie){
            document.querySelector(`[data-cookie-i-d="${recipeID}"]`).dispatchEvent(new Event('click'));
        }
        this.recipeDisplay.scrollTop = 0;
        this.recipeDisplay.innerHTML = this.recipeBuilder.buildRecipe(recipeID);
        document.getElementById('closeBtn').addEventListener('click', () => this.history.back());
    }

    closeRecipe() {
        recipeDisplay.classList.add('hidden');
        if (this.activeCookie) {
            const cookie = this.activeCookie;
            // Animate back to original position
            cookie.style.transform = '';
            cookie.style.transition = '';

            this.activeCookie = null;
            
            // Wait for animation to complete before resetting position
            setTimeout(() => {
                cookie.style.position = '';
                cookie.style.left = '';
                cookie.style.top = '';
                cookie.style.margin = '';
                cookie.style.zIndex = '';
                cookie.classList.remove("zooming");
            }, 150);
        }
    }
}

function snakeToDisplay(str) {
	return str
		.split('_')
		.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(' ');
}

function kebabToDisplay(str){
	return str
		.split('-')
		.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(' ');
}

const app = new App();