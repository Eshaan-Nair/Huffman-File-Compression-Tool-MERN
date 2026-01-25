// Node class for Huffman Tree (similar to your C++ Node class)
class Node {
  constructor(char, freq, left = null, right = null) {
    this.char = char;
    this.freq = freq;
    this.left = left;
    this.right = right;
  }
}

// Build frequency table (similar to buildingFrequencyTable in C++)
function buildFrequencyTable(data) {
  const freqTable = {};
  for (let i = 0; i < data.length; i++) {
    const char = data[i];
    freqTable[char] = (freqTable[char] || 0) + 1;
  }
  return freqTable;
}

// Build Huffman Tree (similar to buildingHuffmanTree in C++)
function buildHuffmanTree(freqTable) {
  // Create priority queue (using array and sorting)
  const nodes = [];
  
  for (const [char, freq] of Object.entries(freqTable)) {
    nodes.push(new Node(char, freq));
  }

  // Build tree by combining nodes with lowest frequencies
  while (nodes.length > 1) {
    // Sort by frequency (similar to priority_queue in C++)
    nodes.sort((a, b) => a.freq - b.freq);
    
    const left = nodes.shift();
    const right = nodes.shift();
    const parent = new Node(null, left.freq + right.freq, left, right);
    nodes.push(parent);
  }

  return nodes[0];
}

// Generate Huffman codes (similar to generateCode in C++)
function generateCodes(root, code = '', codes = {}) {
  if (!root) return codes;

  // Leaf node - store the code
  if (!root.left && !root.right) {
    codes[root.char] = code || '0'; // Handle single character case
    return codes;
  }

  generateCodes(root.left, code + '0', codes);
  generateCodes(root.right, code + '1', codes);
  
  return codes;
}

// Encode text using Huffman codes (similar to encodeText in C++)
function encodeText(data, codes) {
  let encodedString = '';
  for (let i = 0; i < data.length; i++) {
    encodedString += codes[data[i]];
  }
  return encodedString;
}

// Convert binary string to bytes (similar to convertToBinary in C++)
function convertToBinary(encodedString) {
  const bytes = [];
  let byte = 0;
  let bitCount = 0;

  for (let i = 0; i < encodedString.length; i++) {
    byte <<= 1;
    if (encodedString[i] === '1') {
      byte |= 1;
    }
    bitCount++;

    if (bitCount === 8) {
      bytes.push(byte);
      byte = 0;
      bitCount = 0;
    }
  }

  // Handle remaining bits
  if (bitCount > 0) {
    byte <<= (8 - bitCount);
    bytes.push(byte);
  }

  return Buffer.from(bytes);
}

// Convert bytes back to binary string
function convertFromBinary(buffer) {
  let binaryString = '';
  for (let i = 0; i < buffer.length; i++) {
    binaryString += buffer[i].toString(2).padStart(8, '0');
  }
  return binaryString;
}

// Decode text using Huffman tree (similar to decodeText in C++)
function decodeText(root, encodedString, originalLength) {
  let decodedString = '';
  let current = root;

  for (let i = 0; i < encodedString.length; i++) {
    if (encodedString[i] === '0') {
      current = current.left;
    } else {
      current = current.right;
    }

    // Leaf node found
    if (!current.left && !current.right) {
      decodedString += current.char;
      current = root;

      // Stop if we've decoded enough characters
      if (decodedString.length === originalLength) {
        break;
      }
    }
  }

  return decodedString;
}

// Main compression function
function compress(data) {
  if (!data || data.length === 0) {
    throw new Error('Input data is empty');
  }

  // Build frequency table
  const freqTable = buildFrequencyTable(data);
  
  // Build Huffman tree
  const root = buildHuffmanTree(freqTable);
  
  // Generate codes
  const codes = generateCodes(root);
  
  // Encode text
  const encodedString = encodeText(data, codes);
  
  // Convert to binary
  const compressedData = convertToBinary(encodedString);

  return {
    compressedData,
    codes,
    originalLength: data.length,
    encodedLength: encodedString.length
  };
}

// Main decompression function
function decompress(compressedData, codes, originalLength) {
  // Rebuild Huffman tree from codes
  const root = rebuildTreeFromCodes(codes);
  
  // Convert binary back to string
  const encodedString = convertFromBinary(compressedData);
  
  // Decode
  const decodedText = decodeText(root, encodedString, originalLength);
  
  return decodedText;
}

// Rebuild Huffman tree from saved codes
function rebuildTreeFromCodes(codes) {
  const root = new Node(null, 0);

  for (const [char, code] of Object.entries(codes)) {
    let current = root;
    
    for (let i = 0; i < code.length; i++) {
      if (code[i] === '0') {
        if (!current.left) {
          current.left = new Node(null, 0);
        }
        current = current.left;
      } else {
        if (!current.right) {
          current.right = new Node(null, 0);
        }
        current = current.right;
      }
    }
    
    current.char = char;
  }

  return root;
}

module.exports = {
  compress,
  decompress,
  buildFrequencyTable,
  buildHuffmanTree,
  generateCodes
};