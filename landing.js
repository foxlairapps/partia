const rulesButton = document.getElementById("welcome-rules-button");
if (rulesButton) {
  rulesButton.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    window.location.href = "./rules.html";
  }, true);
}

const tutorialButton = document.getElementById("tutorial-game-button");
if (tutorialButton) {
  tutorialButton.addEventListener("click", () => {
    sessionStorage.setItem("patria-tutorial-requested", "1");
    const overlay = document.createElement("div");
    overlay.className = "tutorial-placeholder";
    overlay.innerHTML = `
      <section class="tutorial-placeholder-card" role="dialog" aria-modal="true" aria-labelledby="tutorial-placeholder-title">
        <span class="landing-pretitle">Výukový režim</span>
        <h2 id="tutorial-placeholder-title">Tutorial je připravený k doplnění</h2>
        <p>Vstup do tutorialu už má vlastní místo v hlavní nabídce. Samotného průvodce základy hry doplníme jako další krok.</p>
        <button type="button">Zpět na hlavní nabídku</button>
      </section>`;
    document.body.appendChild(overlay);
    const close = () => overlay.remove();
    overlay.querySelector("button")?.addEventListener("click", close);
    overlay.addEventListener("click", (event) => { if (event.target === overlay) close(); });
    document.addEventListener("keydown", function esc(event){
      if(event.key === "Escape"){ close(); document.removeEventListener("keydown", esc); }
    });
  });
}
