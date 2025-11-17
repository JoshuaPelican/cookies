const cookieContainer = document.getElementById("cookieBox");
const recipeDisplay = document.getElementById("recipeDisplay");
const cookieNameTip = document.getElementById("cookieNameTip");

function displayRecipe(recipeID) {
    recipeDisplay.innerHTML = buildRecipe(recipeID);
    document.getElementById('closeBtn').addEventListener('click', closeRecipe);
}

let activeCookie = null;

function closeRecipe() {
    recipeDisplay.classList.add('hidden');
    if (activeCookie) {
        // Animate back to original position
        activeCookie.style.transform = '';
        activeCookie.style.transition = '';

        const cookie = activeCookie;
        activeCookie = null;
        
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

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeRecipe();
    }
});

function init() {
    const recipeKeys = recipeList.slice(0);
    
    // Create cookie elements for each recipe
    for (let i = 1; i < recipeKeys.length; i++) {
        const cookie = document.createElement('img');
        cookie.src = `svg/${recipeKeys[i]}.svg`
        cookie.className = 'cookie';
        cookie.dataset.cookieID = recipeKeys[i];
        cookieContainer.appendChild(cookie);
        
        cookie.addEventListener("click", function (e) {
            if (activeCookie) return;
            
            var rect = this.getBoundingClientRect();
            
            // Switch to fixed positioning at current visual location
            this.style.position = 'fixed';
            this.style.left = rect.left + 35 + 'px'; // magic ugly number
            this.style.top = rect.top + 70 + 'px'; // another magic number
            this.style.margin = '0';
            
            // Force reflow to apply position change before animating
            void this.offsetHeight;
            
            const viewportCenterX = window.innerWidth / 2;
            const viewportCenterY = window.innerHeight / 2;
            
            rect = this.getBoundingClientRect();

            // Calculate translation to center
            const translateX = viewportCenterX - (rect.left + 100);
            const translateY = viewportCenterY - (rect.top + 100);
            
            // Calculate scale to fill viewport
            const diagonal = Math.sqrt((window.innerWidth ** 2) + (window.innerHeight ** 2));
            const scale = diagonal / 180; // 180 is slightly smaller than cookie width
            
            this.style.transition = "transform 0.8s ease-out";
            this.style.transform = `translate(${translateX-35}px, ${translateY-70}px) scale(${scale})`;
            
            this.classList.add("zooming");
            activeCookie = this;
            
            setTimeout(() => {
                displayRecipe(this.dataset.cookieID);
                recipeDisplay.classList.remove('hidden');
            }, 500);
        });

        cookie.addEventListener("mouseenter", function (e) {
            cookieNameTip.classList.remove("hidden");
            const rect = this.getBoundingClientRect();
            const cookieCenterX = rect.left + (rect.width / 2);
            const cookieCenterY = rect.top + (rect.height / 2);

            cookieNameTip.innerText = this.dataset.cookieID;

            cookieNameTip.style.left = (cookieCenterX - (cookieNameTip.getBoundingClientRect().width / 2)) + 'px';
            cookieNameTip.style.top = (cookieCenterY - 180) + 'px'; // same 180
        });

        cookie.addEventListener("mouseleave", function (e) {
            cookieNameTip.classList.add("hidden");
        });
    }
}