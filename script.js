const strainRows = document.querySelectorAll("[data-strain]");
const dnaOutput = document.querySelector("#strain-dna");
const result = document.querySelector(".lab-result");
const form = document.querySelector(".lab-form");
const goalInput = document.querySelector("#goal");
const modeInput = document.querySelector("#mode");
const opsStatus = document.querySelector("#ops-status");
const dockTask = document.querySelector(".dock-task");
const deployCommand = document.querySelector("#deploy-command");
const deployTabs = document.querySelectorAll("[data-command]");
const deployOsTabs = document.querySelectorAll("[data-os]");
const deployBodyCopy = document.querySelector(".deploy-body p");
const copyCommand = document.querySelector(".copy-command");
const marketTabs = document.querySelectorAll("[data-filter]");
const registerStrainButton = document.querySelector(".register-strain");

const deployCommandSets = {
  unix: [
    "curl -fsSL https://raw.githubusercontent.com/mmenicah84/virus-protocol/main/scripts/install.sh | bash",
    "git clone https://github.com/mmenicah84/virus-protocol.git",
    "npm install && npm start",
    'node ./bin/virus.js run "Analyze an AI agent project" --strain research --mode balanced',
  ],
  windows: [
    'powershell -Command "git clone https://github.com/mmenicah84/virus-protocol.git; Set-Location virus-protocol; npm install; npm test"',
    "git clone https://github.com/mmenicah84/virus-protocol.git",
    "npm install && npm start",
    'node ./bin/virus.js run "Analyze an AI agent project" --strain research --mode balanced',
  ],
};

const dnaMap = {
  "Research-Strain": "Research-Strain: search, verify, summarize, cite, score.",
  "Code-Strain": "Code-Strain: plan, implement, test, document, ship.",
  "Audit-Strain": "Audit-Strain: detect, limit, verify, rollback, report.",
  "Market-Strain": "Market-Strain: segment, message, distribute, measure, iterate.",
};

let activeStrain = "Research-Strain";
let activeDeployOs = "unix";
let activeDeployCommandIndex = 0;
let activeFilter = "all";

function setActiveStrain(strainId) {
  activeStrain = strainId;
  const activeRow = Array.from(strainRows).find((row) => row.dataset.strain === strainId);

  strainRows.forEach((item) => {
    const isActive = item === activeRow;
    item.classList.toggle("active", isActive);
    item.setAttribute("aria-pressed", String(isActive));
  });

  dnaOutput.textContent = dnaMap[activeStrain];
  result.textContent = `Active strain: ${activeStrain}. Ready for task input.`;

  if (opsStatus) {
    opsStatus.textContent = activeStrain.replace("-Strain", "");
  }
}

function updateDeployCommand() {
  deployCommand.textContent = deployCommandSets[activeDeployOs][activeDeployCommandIndex];
  if (deployBodyCopy) {
    deployBodyCopy.textContent =
      activeDeployOs === "windows"
        ? "# Install the VIRUS runtime on Windows, then run the local API and CLI from PowerShell."
        : "# Install the VIRUS runtime, launch a local agent host, and connect your first strain.";
  }
  if (copyCommand) {
    copyCommand.textContent = "Copy";
  }
}

function setActiveDeployTab(index) {
  activeDeployCommandIndex = index;

  deployTabs.forEach((item, itemIndex) => {
    const isActive = itemIndex === index;
    item.classList.toggle("active", isActive);
    item.setAttribute("aria-pressed", String(isActive));
  });

  updateDeployCommand();
}

function applyMarketFilter(filter) {
  activeFilter = filter;

  marketTabs.forEach((tab) => {
    const isActive = tab.dataset.filter === filter;
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-pressed", String(isActive));
  });

  const visibleRows = Array.from(strainRows).filter((row) => {
    return filter === "all" || row.dataset.category === filter;
  });

  strainRows.forEach((row) => {
    row.hidden = filter !== "all" && row.dataset.category !== filter;
  });

  const currentlyVisible = visibleRows.find((row) => row.dataset.strain === activeStrain);
  const nextRow = currentlyVisible ?? visibleRows[0];

  if (nextRow) {
    setActiveStrain(nextRow.dataset.strain);
  }
}

strainRows.forEach((row) => {
  row.addEventListener("click", () => {
    setActiveStrain(row.dataset.strain);
  });
});

marketTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    applyMarketFilter(tab.dataset.filter);
  });
});

if (registerStrainButton) {
  registerStrainButton.addEventListener("click", () => {
    const fallbackGoal = `Register a custom strain inspired by ${activeStrain}`;
    if (!goalInput.value.trim()) {
      goalInput.value = fallbackGoal;
    }
    if (result) {
      result.textContent = "Custom strain draft prepared. Open Launch Lab to register it.";
    }
    if (opsStatus) {
      opsStatus.textContent = "Draft";
    }
    document.querySelector("#launch")?.scrollIntoView({ behavior: "smooth", block: "start" });
    goalInput.focus();
  });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const goal = goalInput.value.trim();
  const mode = modeInput.value;

  if (!goal) {
    result.textContent = "Enter a task objective before VIRUS can generate the task network.";
    goalInput.focus();
    return;
  }

  result.textContent = `Task network generated: ${activeStrain} will replicate 4 variants in ${mode} mode and enter immune review.`;
  if (opsStatus) {
    opsStatus.textContent = "Running";
  }
  if (dockTask) {
    dockTask.textContent = goal.length > 42 ? `${goal.slice(0, 42)}...` : goal;
  }
});

deployTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    setActiveDeployTab(Array.from(deployTabs).indexOf(tab));
  });
});

deployOsTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    activeDeployOs = tab.dataset.os;

    deployOsTabs.forEach((item) => {
      const isActive = item === tab;
      item.classList.toggle("active", isActive);
      item.setAttribute("aria-pressed", String(isActive));
    });

    updateDeployCommand();
  });
});

if (copyCommand) {
  copyCommand.addEventListener("click", async () => {
    const command = deployCommand.textContent;

    try {
      await navigator.clipboard.writeText(command);
      copyCommand.textContent = "Copied";
    } catch {
      copyCommand.textContent = "Select";
    }
  });
}

setActiveStrain(activeStrain);
deployOsTabs.forEach((tab) => {
  const isActive = tab.dataset.os === activeDeployOs;
  tab.classList.toggle("active", isActive);
  tab.setAttribute("aria-pressed", String(isActive));
});
setActiveDeployTab(activeDeployCommandIndex);
applyMarketFilter(activeFilter);
