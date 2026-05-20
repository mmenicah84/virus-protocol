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
const heroRuntimeCommand = document.querySelector("#hero-runtime-command");
const heroRuntimeTabs = document.querySelectorAll("[data-runtime-command]");
const heroRuntimeCopy = document.querySelector(".runtime-copy");
const previewStatus = document.querySelector("#preview-status");
const previewId = document.querySelector("#preview-id");
const previewMode = document.querySelector("#preview-mode");
const previewCost = document.querySelector("#preview-cost");
const previewReceiptId = document.querySelector("#preview-receipt-id");
const previewStep1 = document.querySelector("#preview-step-1");
const previewStep2 = document.querySelector("#preview-step-2");
const previewStep3 = document.querySelector("#preview-step-3");
const previewReceipt = document.querySelector("#preview-receipt");

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

const heroRuntimeCommands = [
  'node ./bin/virus.js run "Analyze an AI agent project" --strain research --mode balanced',
  "npm start",
  "npm test",
];

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

function createPreviewSeed(value) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash).toString(16).padStart(8, "0").slice(0, 8);
}

function estimatePreviewCost(goal, mode) {
  const modeBase = {
    "Balanced Mutation": 38,
    "Fast Mutation": 24,
    "Low Cost Mutation": 18,
    "High Precision Mutation": 54,
  };
  const lengthCost = Math.min(16, Math.ceil(goal.length / 18));

  return (modeBase[mode] ?? 38) + lengthCost;
}

function updateLabPreview(goal, mode) {
  const seed = createPreviewSeed(`${goal}:${mode}:${activeStrain}`);
  const cost = estimatePreviewCost(goal, mode);
  const strainName = activeStrain.replace("-Strain", "");
  const goalSummary = goal.length > 72 ? `${goal.slice(0, 72)}...` : goal;
  const strategy =
    mode === "Fast Mutation"
      ? "fast-route"
      : mode === "Low Cost Mutation"
        ? "budget-route"
        : mode === "High Precision Mutation"
          ? "precision-route"
          : "balanced-route";

  previewStatus.textContent = "Reviewed";
  previewId.textContent = `vnet_${seed}`;
  previewMode.textContent = mode;
  previewCost.textContent = `${cost} VRS`;
  previewReceiptId.textContent = `rcpt_${seed.slice(0, 6)}`;
  previewStep1.textContent = `${strainName} DNA normalized the objective: ${goalSummary}`;
  previewStep2.textContent = `Immune review passed with ${strategy}, budget guard, and permission scope.`;
  previewStep3.textContent = `Reusable network package prepared with run receipt rcpt_${seed.slice(0, 6)}.`;
  previewReceipt.textContent = `receipt=rcpt_${seed.slice(0, 6)} | network=vnet_${seed} | strain=${strainName.toLowerCase()} | mode=${strategy} | cost=${cost} VRS | status=reviewed`;
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
  updateLabPreview(goal, mode);
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

function setHeroRuntimeCommand(index) {
  const command = heroRuntimeCommands[index] ?? heroRuntimeCommands[0];
  heroRuntimeCommand.textContent = command;

  heroRuntimeTabs.forEach((tab) => {
    const isActive = Number(tab.dataset.runtimeCommand) === index;
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-pressed", String(isActive));
  });

  if (heroRuntimeCopy) {
    heroRuntimeCopy.textContent = "Copy";
  }
}

heroRuntimeTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    setHeroRuntimeCommand(Number(tab.dataset.runtimeCommand));
  });
});

if (heroRuntimeCopy) {
  heroRuntimeCopy.addEventListener("click", async () => {
    const command = heroRuntimeCommand.textContent;

    try {
      await navigator.clipboard.writeText(command);
      heroRuntimeCopy.textContent = "Copied";
    } catch {
      heroRuntimeCopy.textContent = "Select";
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
setHeroRuntimeCommand(0);
