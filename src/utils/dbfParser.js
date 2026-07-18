/**
 * Extremely lightweight client-side dBase III/IV (.dbf) binary file parser
 * Parses binary ArrayBuffer streams into structured JSON objects.
 */
export function parseDbf(arrayBuffer) {
  const view = new DataView(arrayBuffer);
  const u8 = new Uint8Array(arrayBuffer);
  
  // 1. Read Header Info
  const fileType = view.getUint8(0);
  const numRecords = view.getUint32(4, true);
  const headerLength = view.getUint16(8, true);
  const recordLength = view.getUint16(10, true);
  
  // 2. Read Field Descriptors (each is 32 bytes)
  const fields = [];
  let offset = 32;
  const decoder = new TextDecoder('utf-8');
  
  while (offset < headerLength - 1 && u8[offset] !== 0x0D) {
    // Read Field Name (11 bytes)
    const nameBytes = u8.slice(offset, offset + 11);
    let name = decoder.decode(nameBytes).replace(/\0/g, '').trim();
    
    // Field Type (1 byte)
    const type = String.fromCharCode(view.getUint8(offset + 11));
    
    // Field Length (1 byte)
    const length = view.getUint8(offset + 16);
    
    fields.push({ name, type, length });
    offset += 32;
  }
  
  // 3. Read Records
  const records = [];
  let recordOffset = headerLength;
  
  for (let i = 0; i < numRecords; i++) {
    if (recordOffset + recordLength > arrayBuffer.byteLength) {
      break; // Safe boundary limit check
    }
    
    // First byte is the deletion flag (0x20 space = active, 0x2A asterisk = deleted)
    const isDeleted = u8[recordOffset] === 0x2A;
    
    if (!isDeleted) {
      const record = {};
      let fieldOffset = recordOffset + 1; // skip deletion flag
      
      for (const field of fields) {
        const fieldBytes = u8.slice(fieldOffset, fieldOffset + field.length);
        let valStr = decoder.decode(fieldBytes).trim();
        
        let value = valStr;
        if (field.type === 'N' || field.type === 'F') {
          value = valStr ? Number(valStr) : 0;
        } else if (field.type === 'L') {
          value = valStr === 'T' || valStr === 'Y';
        } else if (field.type === 'D') {
          // dBase date is YYYYMMDD -> YYYY-MM-DD
          if (valStr && valStr.length === 8) {
            value = `${valStr.slice(0, 4)}-${valStr.slice(4, 6)}-${valStr.slice(6, 8)}`;
          }
        }
        
        record[field.name] = value;
        fieldOffset += field.length;
      }
      
      records.push(record);
    }
    
    recordOffset += recordLength;
  }
  
  return records;
}
