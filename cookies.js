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
        activeCookie.style.transform = '';
        activeCookie.style.zIndex = '';
        activeCookie.style.transition = '';
        activeCookie.classList.remove("zooming");
        activeCookie = null;
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
            
            const rect = this.getBoundingClientRect();
            const cookieCenterX = rect.left + (rect.width / 2);
            const cookieCenterY = rect.top + (rect.height / 2);
            
            const viewportCenterX = window.innerWidth / 2;
            const viewportCenterY = window.innerHeight / 2;
            
            const translateX = viewportCenterX - cookieCenterX;
            const translateY = viewportCenterY - cookieCenterY;
            
            // Calculate diagonal of viewport
            const diagonal = Math.sqrt(window.innerWidth ** 2 + window.innerHeight ** 2);
            const scale = diagonal / (rect.width * 0.6);
            
            this.style.transition = "transform 0.8s ease-out";
            this.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
            
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
            cookieNameTip.style.top = (cookieCenterY - 180) + 'px';
        });

        cookie.addEventListener("mouseleave", function (e) {
            cookieNameTip.classList.add("hidden");
        });
    }
}