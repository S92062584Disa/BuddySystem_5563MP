let memory = [];
const memoryTable = document.getElementById("memory-table").querySelector("tbody");
const jobTable = document.getElementById("job-table").querySelector("tbody");
const memoryVisual = document.getElementById("memory-visual");


// Defining inital size of the memory pool as 2048
document.addEventListener("DOMContentLoaded", () => {
  const size = 2048;
  memory = [{ size, status: "free", slotId: 1 }];
  updateTables();
  updateVisualization();
});

// function that use to get next power of two (taken from geek of geeks)
function powerOfTwo(n) {
  return 2 ** Math.ceil(Math.log2(n));
}



function allocateMemory(jobName, jobSize) {
  const requiredSize = powerOfTwo(jobSize);

  for (let i = 0; i < memory.length; i++) {
    const block = memory[i];
    if (block.status === "free" && block.size >= requiredSize) {
      const allocatedBlock = splitBlock(block, requiredSize);

      allocatedBlock.status = "occupied";
      allocatedBlock.jobId = jobName;
      allocatedBlock.fragment = allocatedBlock.size - jobSize;

      return;
    }
  }

  alert("Insufficient memory available for allocation.");
}

function splitBlock(block, requiredSize) {
  while (block.size / 2 >= requiredSize) {
    const halfSize = block.size / 2;
    const slotId = memory.length + 1;
    // The splice() method overwrites the original array adding two elements ..w3 school
    memory.splice(
      memory.indexOf(block),
      1,
      { size: halfSize, status: "free", slotId },
      { size: halfSize, status: "free", slotId: slotId + 1 }
    );
    //The find() method returns the value of the first element that passes a test.w3school
    block = memory.find((b) => b.size === halfSize && b.status === "free");
  }
  return block;
}



// deallocation or leaving the memory 


// find the buddy IDs first
function findBuddy(blockIndex) {
  if (blockIndex % 2 === 0) {
    // If the blockIndex is even, the buddy is the next block
    return blockIndex + 1;
  } else {
    // If the blockIndex is odd, the buddy is the previous block
    return blockIndex - 1;
  }
}

// if buddies are free merge
function mergeBlocks() {
  for (let i = 0; i < memory.length; i++) {
    if (memory[i].status === "free") {
      const buddyIndex = findBuddy(i);

      if (
        buddyIndex >= 0 && buddyIndex < memory.length && memory[buddyIndex].status === "free" && memory[i].size === memory[buddyIndex].size
      ) {
        memory[i] = {
          size: memory[i].size * 2,
          status: "free",
          slotId: memory[i].slotId,
        };

        memory.splice(buddyIndex, 1);
        i--;
      }
    }
  }
}


// calling the function according to the Action (arrive (allocation) or Leave (deallocation) )

document.getElementById("add-job").addEventListener("click", () => {
  const jobName = document.getElementById("job-name").value;
  const jobSize = Number(document.getElementById("job-size").value);
  const action = document.getElementById("job-action").value;

  if (action === "arrive") {
    allocateMemory(jobName, jobSize);
  } 
  
  else if (action === "leave") {
    const block = memory.find((b) => b.jobId === jobName);
    if (block) {
      block.status = "free";
      block.jobId = null;
      block.fragment = null;
      mergeBlocks();
    } else {
      alert("Job not found in memory.");
    }
  }

  const row = document.createElement("tr");
  row.innerHTML = `<td>${jobName}</td><td>${action}</td><td>${jobSize}</td>`;
  jobTable.appendChild(row);

  updateTables();
  updateVisualization();
});







// css and styling part

function createMemoryBlock(block, totalMemorySize) {
  const div = document.createElement("div");
  div.className = "memory-block";
  div.style.height = `${(block.size / totalMemorySize) * 100}%`;

  if (block.status === "free") {
    div.classList.add("free");
  } else if (block.status === "occupied") {
    div.classList.add("occupied");
  }

  div.innerHTML = `
    Slot ${block.slotId} (${block.size}kb) - ${block.status}<br>
    ${block.jobId || "Free"}
  `;

  if (block.fragment > 0) {
    const fragmentDiv = document.createElement("div");
    fragmentDiv.className = "fragment-block";
    fragmentDiv.style.height = `${(block.fragment / block.size) * 100}%`;
    fragmentDiv.style.backgroundColor = "yellow";
    fragmentDiv.innerText = `Fragment: ${block.fragment}kb`;
    div.appendChild(fragmentDiv);
  }

  return div;
}

function updateVisualization() {
  memoryVisual.innerHTML = "";
  const totalMemorySize = memory.reduce((acc, block) => acc + block.size, 0);

  memory.forEach((block) => {
    const memoryBlockDiv = createMemoryBlock(block, totalMemorySize);
    memoryVisual.appendChild(memoryBlockDiv);
  });
}





function updateTables() {
  memoryTable.innerHTML = "";
  memory.forEach((block) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${block.slotId}</td>
      <td>${block.size}</td>
      <td>${block.status}</td>
      <td>${block.jobId || "N/A"}</td>
      <td>${block.fragment || 0}</td>
    `;
    memoryTable.appendChild(row);
  });
}
