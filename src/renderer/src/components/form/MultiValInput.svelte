<script lang="ts">
  export let value: string[] | null = null;
  export let label: string = "";
  export let tooltip: string = "";
  export let placeholder: string = "Enter value...";
  export let validationType: 'regex' | 'email' | 'domain' | 'url' | 'transform' | 'none' = 'none';
  
  const htmlId: string = "id" + Math.random().toString(36).substr(2, 9);
  let showModal = false;
  let editingValues: string[] = [];
  let newValue: string = "";
  let validationErrors: { [key: number]: string } = {};
  let newValueError: string = "";
  
  // Ensure value is always an array
  $: internalValue = value || [];
  
  // Update display text
  $: displayText = internalValue.length === 0 
    ? "Click to add values..." 
    : `${internalValue.length} value${internalValue.length === 1 ? '' : 's'} configured`;
  
  function validateValue(val: string, index: number | 'new' = 'new'): boolean {
    const trimmed = val.trim();
    if (!trimmed) {
      if (index === 'new') {
        newValueError = "";
      } else {
        delete validationErrors[index];
      }
      return true;
    }
    
    let error = "";
    
    switch (validationType) {
      case 'regex':
        // PCRE format validation (PHP-style with delimiters)
        const commonDelimiters = ['/', '#', '~', '@', '!', '%', '|', '+'];
        const firstChar = trimmed[0];
        
        if (!commonDelimiters.includes(firstChar)) {
          error = "PCRE regex must start with delimiter (e.g., /pattern/flags)";
        } else {
          const delimiter = firstChar;
          const lastDelimiterPos = trimmed.lastIndexOf(delimiter);
          
          if (lastDelimiterPos <= 0) {
            error = `Missing closing delimiter '${delimiter}'`;
          } else {
            const pattern = trimmed.substring(1, lastDelimiterPos);
            const flags = trimmed.substring(lastDelimiterPos + 1);
            
            // Validate pattern
            if (!pattern) {
              error = "Empty regex pattern";
            } else {
              try {
                // Test if the pattern is valid JavaScript regex
                new RegExp(pattern);
              } catch (e) {
                error = "Invalid regex pattern: " + e.message;
              }
              
              // Validate flags
              if (flags && !/^[imsuxyADJUX]*$/.test(flags)) {
                error = "Invalid PCRE flags (allowed: i,m,s,u,x,y,A,D,J,U,X)";
              }
            }
          }
        }
        break;
        
      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
          error = "Invalid email address";
        }
        break;
        
      case 'domain':
        if (!/^(\*\.)?([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})?$/.test(trimmed)) {
          error = "Invalid domain (use *.example.com for wildcards)";
        }
        break;
        
      case 'url':
        try {
          new URL(trimmed);
        } catch (e) {
          error = "Invalid URL";
        }
        break;
        
      case 'transform':
        if (!trimmed.includes(' -> ')) {
          error = "Invalid format (use: from -> to)";
        }
        break;
    }
    
    if (index === 'new') {
      newValueError = error;
    } else {
      if (error) {
        validationErrors[index] = error;
        validationErrors = {...validationErrors}; // Force reactivity
      } else {
        delete validationErrors[index];
        validationErrors = {...validationErrors}; // Force reactivity
      }
    }
    
    return !error;
  }
  
  function openModal(): void {
    // Create a copy of current values for editing
    editingValues = [...internalValue];
    validationErrors = {};
    newValueError = "";
    // Validate all existing values
    editingValues.forEach((val, idx) => validateValue(val, idx));
    showModal = true;
  }
  
  function closeModal(): void {
    showModal = false;
    newValue = "";
    validationErrors = {};
    newValueError = "";
  }
  
  function saveChanges(): void {
    // Only save if there are no validation errors
    if (Object.keys(validationErrors).length === 0) {
      value = editingValues.filter(v => v.trim() !== '');
      closeModal();
    }
  }
  
  function addNewValue(): void {
    const trimmed = newValue.trim();
    if (trimmed && !editingValues.includes(trimmed) && validateValue(newValue, 'new')) {
      editingValues = [...editingValues, trimmed];
      newValue = "";
      newValueError = "";
    }
  }
  
  function updateValue(index: number, newVal: string): void {
    editingValues[index] = newVal;
    validateValue(newVal, index);
  }
  
  function removeValue(index: number): void {
    editingValues = editingValues.filter((_, i) => i !== index);
  }
  
  function handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && newValue.trim()) {
      event.preventDefault();
      addNewValue();
    }
  }
  
  function handlePaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedText = event.clipboardData?.getData('text');
    if (pastedText) {
      const values = pastedText.split(/[,\n]/).map(v => v.trim()).filter(v => v);
      const uniqueValues = values.filter(v => !editingValues.includes(v));
      editingValues = [...editingValues, ...uniqueValues];
    }
  }
</script>

<div class="form-group">
  <label for={htmlId}>{label}</label>
  <div class="input-group" title={tooltip}>
    <input
      id={htmlId}
      type="text"
      readonly
      value={displayText}
      on:click={openModal}
      class="input input-bordered input-xs flex-grow cursor-pointer"
      style="color: oklch(var(--in));"
    />
    <button type="button" class="btn btn-xs btn-square" on:click={openModal}>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
      </svg>
    </button>
  </div>
</div>

{#if showModal}
<div class="modal modal-open">
  <div class="modal-box max-w-xl">
    <h3 class="font-bold text-sm mb-3">{label}</h3>
    
    <div class="space-y-1 max-h-80 overflow-y-auto pr-2">
      {#each editingValues as val, index}
        <div>
          <div class="flex gap-1">
            <input
              type="text"
              bind:value={editingValues[index]}
              on:input={(e) => updateValue(index, e.currentTarget.value)}
              class="input input-bordered input-xs flex-grow {validationErrors[index] ? 'input-error' : ''}"
              placeholder={placeholder}
            />
            <button 
              type="button"
              class="btn btn-xs btn-error btn-square"
              on:click={() => removeValue(index)}
              title="Remove"
            >
              ×
            </button>
          </div>
          {#if validationErrors[index]}
            <div class="text-xs text-error mt-0.5 ml-1">{validationErrors[index]}</div>
          {/if}
        </div>
      {/each}
      
      <div class="pt-2 border-t border-base-300">
        <div class="flex gap-1">
          <input
            type="text"
            bind:value={newValue}
            on:keydown={handleKeydown}
            on:paste={handlePaste}
            on:input={() => validateValue(newValue, 'new')}
            class="input input-bordered input-xs flex-grow {newValueError ? 'input-error' : ''}"
            placeholder={placeholder}
          />
          <button 
            type="button"
            class="btn btn-xs btn-primary"
            on:click={addNewValue}
            disabled={!newValue.trim() || !!newValueError}
          >
            Add
          </button>
        </div>
        {#if newValueError}
          <div class="text-xs text-error mt-0.5 ml-1">{newValueError}</div>
        {/if}
      </div>
    </div>
    
    <div class="text-xs text-base-content/60 mt-3">
      Tip: You can paste comma or newline separated values
    </div>
    
    <div class="modal-action mt-3">
      <button type="button" class="btn btn-xs" on:click={closeModal}>Cancel</button>
      <button 
        type="button" 
        class="btn btn-xs btn-primary" 
        on:click={saveChanges}
        disabled={Object.keys(validationErrors).length > 0}
      >
        Save
      </button>
    </div>
  </div>
  <div class="modal-backdrop" on:click={closeModal}></div>
</div>
{/if}

<style>
  .input-group {
    display: flex;
    gap: 0.25rem;
    flex-grow: 1;
  }
  
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.3);
    z-index: -1;
  }
</style>