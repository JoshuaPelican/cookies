class CookieManager{
    constructor(){
        this.cookieContainer = document.getElementById("cookieBox");
    }

    buildCookie(recipeID){
        const cookie = document.createElement('img');
        cookie.src = `svg/${recipeID}.svg`
        cookie.className = 'cookie';
        cookie.dataset.cookieID = recipeID;

        return cookie;
    }
}