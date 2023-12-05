// Save an item to local storage
export function saveToLocalStorage(key: string, item: any): void {
  console.log("POOOOOOOOOOOOP")
    try {
      const serializedItem = JSON.stringify(item);
      console.log("I AM IN SAVE TO LOCAL STORAGE", item)
      localStorage.setItem(key, serializedItem);
    } catch (error) {
      console.error(`Error saving item to local storage: ${error}`);
    }
  }
  
  // Retrieve an item from local storage
  export function getFromLocalStorage(key: string): any | null {
    try {
      const serializedItem = localStorage.getItem(key);
      if (serializedItem === null) {
        return null; // Item does not exist in local storage
      }
      return JSON.parse(serializedItem);
    } catch (error) {
      console.error(`Error retrieving item from local storage: ${error}`);
      return null;
    }
  }


  export function getMultipleKeysFromLocalStorage(keyPrefix: string): string[] {
    const matches: string[] = [];
  
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
  
      if (key && key.startsWith(keyPrefix)) {
        matches.push(key);
      }
    }
  
    return matches;
  }
  
  

  
