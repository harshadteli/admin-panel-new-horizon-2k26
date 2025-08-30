 /* === CONFIG SECTION === */
        const guideCommands = [
            { text: "👨‍💻 How to view Data", audio: "../VOICE/1.mp3", reply: "Go to Respective event and click on the view data and see the data." },
            { text: "📲 Data is updated or not", audio: "../VOICE/2.mp3", reply: "Yes, data is updated when new form is Submitted." },
            { text: "📃 How to editing the data", audio: "../VOICE/3.mp3", reply: "When in case of any problem, Go to respective Spread-Sheet and edit it." },
            { text: "❌ Data is not showing..?", audio: "../VOICE/4.mp3", reply: "In case of server down then data is not showing, so go to there respective Spread-Sheet for the viewing the data correctly." },
            { text: "💵 About Payment Information", audio: "../VOICE/5.mp3", reply: "This contain the information about Online Payment by the participate for this event" }
           ];

        /* === DOM ELEMENTS === */
        const aiCommandsContainer = document.getElementById("aiCommands");
        const aiChat = document.getElementById("aiChat");
        const aiGuidePanel = document.getElementById("aiGuidePanel");

        /* === INIT DEFAULT COMMAND BUTTONS === */
        guideCommands.forEach(cmd => {
            let btn = document.createElement("button");
            btn.className = "ai-command-btn";
            btn.innerText = cmd.text;
            btn.onclick = () => handleCommand(cmd);
            aiCommandsContainer.appendChild(btn);
        });

        /* === TOGGLE PANEL === */
        function toggleGuide() {
            aiGuidePanel.style.display = aiGuidePanel.style.display === "flex" ? "none" : "flex";
        }
        function closeGuide() {
            aiGuidePanel.style.display = "none";
        }

        /* === HANDLE COMMAND CLICK === */
        function handleCommand(cmd) {
            addMessage(cmd.text, "user");
            let audio = new Audio(cmd.audio);
            audio.play();
            setTimeout(() => {
                addMessage(cmd.reply, "bot");
            }, 800);
        }

        /* === ADD CHAT MESSAGE === */
        function addMessage(text, sender) {
            let msg = document.createElement("div");
            msg.className = `ai-msg ${sender}`;
            msg.innerText = text;
            aiChat.appendChild(msg);
            aiChat.scrollTop = aiChat.scrollHeight;
        }

        /* === ONE-TIME WELCOME MESSAGE === */
        window.addEventListener("load", () => {
            if (!localStorage.getItem("aiGuideWelcomeShown")) {
                let tooltip = document.createElement("div");
                tooltip.className = "ai-welcome-tooltip";
                tooltip.innerText = "Need any help? Just ask me! ⬇↘️";
                document.body.appendChild(tooltip);

                localStorage.setItem("aiGuideWelcomeShown", "true");

                setTimeout(() => {
                    tooltip.remove();
                }, 4000);
            }
        });