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
const copyCommand = document.querySelector(".copy-command");
const heroDeployCommand = document.querySelector("#hero-deploy-command");
const heroDeployTabs = document.querySelectorAll("[data-hero-command]");
const heroCopyCommand = document.querySelector(".hero-copy-command");

const dnaMap = {
  "Research-Strain": "Research-Strain: search, verify, summarize, cite, score.",
  "Code-Strain": "Code-Strain: plan, implement, test, document, ship.",
  "Audit-Strain": "Audit-Strain: detect, limit, verify, rollback, report.",
  "Market-Strain": "Market-Strain: segment, message, distribute, measure, iterate.",
};

let activeStrain = "Research-Strain";

strainRows.forEach((row) => {
  row.addEventListener("click", () => {
    strainRows.forEach((item) => item.classList.remove("active"));
    row.classList.add("active");
    activeStrain = row.dataset.strain;
    dnaOutput.textContent = dnaMap[activeStrain];
    result.textContent = `Active strain: ${activeStrain}. Waiting for task input.`;
    if (opsStatus) {
      opsStatus.textContent = activeStrain.replace("-Strain", "");
    }
  });
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const goal = goalInput.value.trim();
  const mode = modeInput.value;

  if (!goal) {
    result.textContent = "Enter a task objective before VIRUS can generate the infection map.";
    goalInput.focus();
    return;
  }

  result.textContent = `Infection map generated: ${activeStrain} will replicate 4 variants in ${mode} mode and enter immune review.`;
  if (opsStatus) {
    opsStatus.textContent = "Running";
  }
  if (dockTask) {
    dockTask.textContent = goal.length > 42 ? `${goal.slice(0, 42)}...` : goal;
  }
});

deployTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    deployTabs.forEach((item) => item.classList.remove("active"));
    tab.classList.add("active");
    deployCommand.textContent = tab.dataset.command;
    if (copyCommand) {
      copyCommand.textContent = "Copy";
    }
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

heroDeployTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    heroDeployTabs.forEach((item) => item.classList.remove("active"));
    tab.classList.add("active");
    heroDeployCommand.textContent = tab.dataset.heroCommand;
    if (heroCopyCommand) {
      heroCopyCommand.textContent = "Copy";
    }
  });
});

if (heroCopyCommand) {
  heroCopyCommand.addEventListener("click", async () => {
    const command = heroDeployCommand.textContent;

    try {
      await navigator.clipboard.writeText(command);
      heroCopyCommand.textContent = "Copied";
    } catch {
      heroCopyCommand.textContent = "Select";
    }
  });
}
