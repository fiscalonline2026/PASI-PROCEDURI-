// ==================== LISTA COMPLETĂ A PROCEDURILOR ====================
const allProcedures = [
    "Fiscalizare", "Mod conectare la server ANAF", "Instructaj client", "Revizie AMEF",
    "Schimbare punct de lucru", "Schimbare cote TVA", "Introducere articole PLU",
    "Predare memorie fiscală", "Înlocuire jurnal electronic", "Înlocuire placă de bază",
    "Înlocuire modul SAM", "Prelungire abonament de date AMEF", "Înlocuire placă de alimentare",
    "Înlocuire baterie RAM", "Înlocuire tastatură AMEF", "Înlocuire display client-operator",
    "Înlocuire acumulator", "Înlocuire imprimantă termică", "Listă erori AMEF", "Parametri de sistem"
];

// Combină toate procedurile din fișierele externe
const procedureDetails = {
    datecs: typeof datecsProcedures !== 'undefined' ? datecsProcedures : {},
    daisy: typeof daisyProcedures !== 'undefined' ? daisyProcedures : {},
    incotex: typeof incotexProcedures !== 'undefined' ? incotexProcedures : {},
    tremol: typeof tremolProcedures !== 'undefined' ? tremolProcedures : {},
    partner: typeof partnerProcedures !== 'undefined' ? partnerProcedures : {},
    zit: typeof zitProcedures !== 'undefined' ? zitProcedures : {}
};

// Completează procedurile lipsă pentru fiecare model
const models = ["datecs", "daisy", "incotex", "tremol", "partner", "zit"];
models.forEach(model => {
    allProcedures.forEach(proc => {
        if (!procedureDetails[model][proc]) {
            procedureDetails[model][proc] = {
                description: `Procedura nu este documentată în manualul disponibil pentru ${model.toUpperCase()}.`,
                steps: [
                    "Verificați modelul exact și versiunea aparatului.",
                    "Nu aplicați proceduri de la alt model.",
                    "Solicitați manualul de service corespunzător sau intervenția unei unități autorizate."
                ],
                warnings: ["Nu au fost inventați pași tehnici care nu apar în documentația disponibilă."]
            };
        }
    });
});

// Adaugă HARD RESET doar pentru DAISY
if (procedureDetails.daisy && !procedureDetails.daisy["eXpert SX procedura HARD RESET"]) {
    procedureDetails.daisy["eXpert SX procedura HARD RESET"] = {
        description: "Resetare hardware pentru DAISY Expert SX",
        steps: [
            "Îndepărtează cardul microSD",
            "Desfaceți șuruburile, decuplează acumulatorul",
            "Mută jumperul de sub bateria RAM cu un pin mai jos",
            "Apasă POWER de 3-4 ori",
            "Conectează acumulatorul, pornește",
            "Introdu parola SERVICE, setează data/ora",
            "Mută jumperul înapoi"
        ]
    };
}

function getProceduresForModel(model) {
    let procs = [...allProcedures];
    if (model === 'daisy') procs.push("eXpert SX procedura HARD RESET");
    return procs;
}

let currentModel = 'zit';
let currentProcedure = null;

function renderProceduresList(model) {
    const container = document.getElementById('proceduresList');
    const searchTerm = document.getElementById('searchProcedure').value.toLowerCase();
    let procedures = getProceduresForModel(model).filter(p => p.toLowerCase().includes(searchTerm));
    const count = document.getElementById('procedureCount');
    if (count) count.textContent = procedures.length;

    if (procedures.length === 0) {
        container.innerHTML = '<div class="empty-list"><strong>Niciun rezultat</strong><br>Încearcă un alt termen de căutare.</div>';
        return;
    }

    container.innerHTML = procedures.map(proc => `
        <div class="procedure-item ${currentProcedure === proc ? 'active' : ''}" onclick="showDetails('${proc.replace(/'/g, "\'")}')">
            ${proc}
        </div>
    `).join('');
}

window.showDetails = function(procedure) {
    currentProcedure = procedure;
    const details = procedureDetails[currentModel]?.[procedure];
    const container = document.getElementById('procedureDetails');
    
    if (!details) {
        container.innerHTML = `<h2>${procedure}</h2><div class="procedure-content"><div class="info-box">Procedura nu este documentată în manualul disponibil.</div></div>`;
        renderProceduresList(currentModel);
        return;
    }
    
    let html = `<h2>${procedure} <small>${currentModel.toUpperCase()}</small></h2><div class="procedure-content">`;
    html += `<p><strong>Descriere:</strong> ${details.description || ''}</p>`;
    
    if (details.steps && details.steps.length > 0) {
        html += '<h3>Pași de urmat:</h3><ol>';
        details.steps.forEach(step => html += `<li>${step}</li>`);
        html += '</ol>';
    }
    
    if (details.warnings) {
        html += '<div class="warning-box"><strong>Atenție!</strong><ul>';
        details.warnings.forEach(w => html += `<li>${w}</li>`);
        html += '</ul></div>';
    }
    
    if (details.tools) html += `<p><strong>Unelte:</strong> ${details.tools}</p>`;
    
    if (details.errors && details.errors.length > 0) {
        html += '<h3>Listă erori</h3><div class="error-codes-grid">';
        details.errors.forEach(err => {
            html += `<div class="error-code-item ${err.urgent ? 'urgent' : ''}">
                        <div class="error-code">Cod: ${err.code}</div>
                        <div class="error-description"><strong>Descriere:</strong> ${err.description}</div>
                        <div class="error-solution"><strong>🔧 Soluție:</strong> ${Array.isArray(err.solution) ? err.solution.join('<br>') : err.solution}</div>
                    </div>`;
        });
        html += '</div>';
    }
    
    html += '</div>';
    container.innerHTML = html;
    renderProceduresList(currentModel);
};

document.querySelectorAll('.model-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.model-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        currentModel = this.dataset.model;
        currentProcedure = null;
        const modelLabel = document.getElementById('currentModelLabel');
        if (modelLabel) modelLabel.textContent = currentModel.toUpperCase();
        renderProceduresList(currentModel);
        document.getElementById('procedureDetails').innerHTML = `
            <div class="empty-state">
                <div class="empty-illustration" aria-hidden="true">
                    <span class="doc-line line-one"></span><span class="doc-line line-two"></span><span class="doc-line line-three"></span><span class="doc-check">✓</span>
                </div>
                <span class="section-kicker">SPAȚIU DE LUCRU</span>
                <h2>Selectați o procedură</h2>
                <p>Alegeți o procedură din listă pentru modelul <strong>${currentModel.toUpperCase()}</strong>.</p>
            </div>`;
    });
});

document.getElementById('searchProcedure').addEventListener('input', () => renderProceduresList(currentModel));

renderProceduresList('zit');

// Scurtătură pentru focalizarea rapidă a căutării
window.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        document.getElementById('searchProcedure')?.focus();
    }
});
