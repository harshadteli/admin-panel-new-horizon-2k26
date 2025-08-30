const form = document.getElementById("loginForm");
    const popup = document.getElementById("popup");
    const grantedAudio = document.getElementById("grantedAudio");
    const deniedAudio = document.getElementById("deniedAudio");

    const correctPassword = "nckbcs1971"; // Change as needed

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;
      if (password === correctPassword) {
        // Save username in localStorage
        localStorage.setItem("adminName", username);

        popup.innerText = username + " : Access Granted ,Please Wait for Processing..";
        popup.className = "popup success";
        popup.style.display = "block";
        grantedAudio.play();

        const scriptURL = 'https://script.google.com/macros/s/AKfycbyIOHLYuGYipscVLGoePnY1EIQDYL5kJGkj68f2HZZ7d-Mc8DWEpTBnBIlhhVOsxjreNw/exec';
        //   const form = document.forms['submit-to-google-sheet';
        const adminform = document.forms['admin-form'];


        fetch(scriptURL, { method: 'POST', body: new FormData(adminform) })
          .then(response => {
            console.log('Success!', response);

            setTimeout(() => {
              popup.style.display = "none";
              window.location.href = "./PAGES/dashboard.html"; // Redirect
            }, 500);

          })
          .catch(error => {
            console.error('Error!', error.message);
            alert('Something went wrong! Please try again.');
            //document.getElementById('loading-spinner').style.display = 'none';

          });
      }
      else {
        popup.innerText = username + " : Access Denied, Wait for reloading...";
        popup.className = "popup error";
        popup.style.display = "block";
        deniedAudio.play();
        setTimeout(() => {
          popup.style.display = "none";
          window.open('index.html');
        }, 2500);


        const scriptURL = 'https://script.google.com/macros/s/AKfycbyIOHLYuGYipscVLGoePnY1EIQDYL5kJGkj68f2HZZ7d-Mc8DWEpTBnBIlhhVOsxjreNw/exec';
        //   const form = document.forms['submit-to-google-sheet';
        const adminform = document.forms['admin-form'];



        fetch(scriptURL, { method: 'POST', body: new FormData(adminform) })
          .then(response => {
            console.log('Success!', response);
          })
          .catch(error => {
            console.error('Error!', error.message);
            alert('Something went wrong! Please try again.');


          });
      }
    });