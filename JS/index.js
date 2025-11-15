'use strict';
const form = document.getElementById("loginForm");
const popup = document.getElementById("popup");
const grantedAudio = document.getElementById("grantedAudio");
const deniedAudio = document.getElementById("deniedAudio");
const correctPassword = "nckbcs1971"; 
const scriptURL = 'https://script.google.com/macros/s/AKfycbyIOHLYuGYipscVLGoePnY1EIQDYL5kJGkj68f2HZZ7d-Mc8DWEpTBnBIlhhVOsxjreNw/exec';
const adminform = document.forms['admin-form'];
form.addEventListener("submit", function (e) {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (password === correctPassword) {
        localStorage.setItem("adminName", username);
        popup.innerText = username + " : Access Granted, Please Wait for Processing...";
        popup.className = "popup success";
        popup.style.display = "block";
        grantedAudio.play();
        fetch(scriptURL, { method: 'POST', body: new FormData(adminform) })
            .then(response => {
                console.log('Admin login recorded successfully!', response);
                setTimeout(() => {
                    popup.style.display = "none";
                    window.location.replace("./PAGES/dashboard.html"); 
                }, 500);
            })
            .catch(error => {
                console.error('Error logging success to Sheet:', error.message);
                setTimeout(() => {
                    window.location.replace("./PAGES/dashboard.html");
                }, 500);
            });
    } else {
        popup.innerText = username + " : Access Denied, Wait for reloading...";
        popup.className = "popup error";
        popup.style.display = "block";
        deniedAudio.play();
        localStorage.removeItem("adminName");
        fetch(scriptURL, { method: 'POST', body: new FormData(adminform) })
            .then(response => {
                console.log('Failed attempt recorded successfully!', response);
            })
            .catch(error => {
                console.error('Error logging failure to Sheet:', error.message);
            });
        setTimeout(() => {
            popup.style.display = "none";
            window.location.reload(); 
        }, 2500);
    }
});
