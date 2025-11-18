class CookieManager{
    buildCookie(recipeID){
        const cookie = document.createElement('img');
        cookie.src = `svg/${recipeID}.svg`
        cookie.className = 'cookie';
        cookie.dataset.cookieID = recipeID;

        if(cookie.dataset.cookieID == "snowball")
        {
            cookie.style.width = "160px"
            cookie.style.height = "160px"
        }

        return cookie;
    }
}