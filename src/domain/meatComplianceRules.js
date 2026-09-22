/**
 * meatComplianceRules.js
 * Domain Core: Meat Rabbit Compliance, Regulatory Educational Framework, and Labeling Standards
 * Pure Business Logic - No UI, No DB, No Network Dependencies.
 */

export const PROCESSING_METHODS = {
  ON_FARM_EXEMPT: {
    id: 'on_farm_exempt',
    label: 'On-Farm Producer Exemption (Direct-to-Consumer)',
    description: 'Small-scale producer harvesting on own farm for direct sale to end consumers. Regulated under state food safety codes and FDA cGMPs.'
  },
  CUSTOM_EXEMPT: {
    id: 'custom_exempt',
    label: 'Custom Processing (Household Use Only)',
    description: 'Animal processed for the owner of the live animal. Must be labeled "NOT FOR SALE" and consumed exclusively by the owner and household.'
  },
  STATE_INSPECTED: {
    id: 'state_inspected',
    label: 'State Department of Agriculture Inspected',
    description: 'Harvested in a state-licensed and inspected meat facility. Authorized for intrastate commercial sales (restaurants, retail) within state borders.'
  },
  USDA_VOLUNTARY: {
    id: 'usda_voluntary',
    label: 'USDA Voluntary Inspection (9 CFR Part 354)',
    description: 'Federal fee-for-service inspection by USDA FSIS. Displays circular USDA inspection mark; eligible for unrestricted interstate and export sales.'
  }
};

export const SALES_CHANNELS = {
  ON_FARM_DIRECT: {
    id: 'on_farm_direct',
    label: 'On-Farm Direct Sale',
    interstateRisk: false
  },
  FARMERS_MARKET: {
    id: 'farmers_market',
    label: 'Farmers Market / Roadside Stand',
    interstateRisk: false
  },
  RESTAURANT: {
    id: 'restaurant',
    label: 'Licensed Restaurant / Food Service',
    interstateRisk: false
  },
  RETAIL_GROCERY: {
    id: 'retail_grocery',
    label: 'Retail Grocery / Local Butcher Shop',
    interstateRisk: false
  },
  WHOLESALE: {
    id: 'wholesale',
    label: 'Wholesale Distributor',
    interstateRisk: false
  },
  INTERSTATE: {
    id: 'interstate',
    label: 'Interstate Commerce (Across State Lines)',
    interstateRisk: true
  }
};

export const STANDARD_COMPLIANCE_DISCLAIMER = 
  "This is general education only. Always verify current federal, state, and local rules before selling rabbit meat.";

export const EXTENDED_LEGAL_DISCLAIMER =
  "RabbitryPedigree Pro (WarrenWise Pro) provides record-keeping, labeling assistance, and educational reference tools only. Nothing herein constitutes legal counsel, official regulatory approval, or a food safety certificate. Rabbit is a non-amenable species not subject to mandatory USDA FSIS inspection, falling under FDA jurisdiction (21 CFR Part 117) and diverse state Department of Agriculture / Department of Health codes. Always consult your state agricultural extension or regulatory authority.";

export const OFFICIAL_REGULATORY_REFERENCES = [
  {
    authority: 'USDA FSIS',
    title: 'Voluntary Inspection of Rabbits & Edible Products Thereof (9 CFR Part 354)',
    url: 'https://www.ecfr.gov/current/title-9/chapter-III/subchapter-A/part-354',
    summary: 'Federal regulations governing voluntary fee-for-service rabbit inspection, sanitation, ante-mortem, post-mortem, and labeling.'
  },
  {
    authority: 'FDA CFSAN',
    title: 'Current Good Manufacturing Practice (cGMP) in Food (21 CFR Part 117)',
    url: 'https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfcfr/CFRSearch.cfm?CFRPart=117',
    summary: 'FDA standards requiring clean handling, sanitary water, temperature control, and prevention of food adulteration.'
  },
  {
    authority: 'NASDA',
    title: 'Directory of State Departments of Agriculture',
    url: 'https://www.nasda.org/policy/state-directories/',
    summary: 'Comprehensive directory to contact your state meat inspection and small-farm regulatory offices.'
  }
];

export const SANITATION_CHECKLIST_ITEMS = [
  { id: 'potable_water', label: 'Potable Water Tested & Clean Ice Source (<40°F Chilling)' },
  { id: 'sanitized_surfaces', label: 'Food-Contact Surfaces Sanitized (Stainless / NSF-Grade SSOP)' },
  { id: 'rapid_chill', label: 'Rapid Chill Verified (Carcass internal temperature <40°F within 4 hours)' },
  { id: 'viscera_check', label: 'Internal Viscera Checked (Clean liver, lungs, kidneys; no signs of disease)' },
  { id: 'food_grade_pack', label: 'Food-Grade Packaging Sealed with Batch Lot Number & Pack Date' },
  { id: 'temperature_log', label: 'Cold-Chain Storage Maintained (<38°F Refrigerated / <0°F Frozen)' }
];

export const LABEL_EXEMPTION_STATEMENTS = {
  ON_FARM_EXEMPT: 'Exempt from USDA FSIS Mandatory Inspection under State Law — Sold Directly to Consumer.',
  CUSTOM_NOT_FOR_SALE: 'NOT FOR SALE — Custom Processed for Household Consumption Only.',
  STATE_INSPECTED: 'Inspected and Passed by State Department of Agriculture (Intrastate Sale Only).',
  USDA_VOLUNTARY: 'Inspected for Wholesomeness by U.S. Department of Agriculture (9 CFR 354).'
};

export const SAFE_HANDLING_INSTRUCTIONS = 
  "SAFE HANDLING INSTRUCTIONS: Keep refrigerated (<40°F) or frozen (<0°F). Thaw in refrigerator or microwave. Keep raw meat separate from other foods. Wash working surfaces, utensils, and hands after touching raw meat. Cook thoroughly to an internal temperature of 165°F measured by a food thermometer.";

/**
 * Validates a meat processing lot entry
 */
export function validateMeatLotRecord(record = {}) {
  const errors = [];

  if (!record.lotNumber || record.lotNumber.trim().length < 2) {
    errors.push('Lot / Batch Number is required for traceability.');
  }

  const head = Number(record.headCount);
  if (isNaN(head) || head <= 0) {
    errors.push('Head count must be a positive integer.');
  }

  const dressed = Number(record.totalDressedWeightLbs);
  if (isNaN(dressed) || dressed <= 0) {
    errors.push('Total dressed weight is required for yield tracking.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Evaluates whether an order or destination requires an interstate compliance alert
 */
export function evaluateInterstateCompliance(salesChannelId) {
  if (salesChannelId === 'interstate') {
    return {
      isCaution: true,
      severity: 'high',
      title: 'Interstate Commerce Scrutiny Warning',
      message: 'Transporting or shipping uninspected rabbit meat across state lines is subject to strict FDA FD&C Act oversight (21 U.S.C. 331) and receiving state importation laws. Without USDA Voluntary Inspection (9 CFR Part 354) or formal state reciprocity, interstate sales often violate state or federal law. Verify with both state agricultural agencies before shipment.'
    };
  }
  return {
    isCaution: false,
    severity: 'low',
    title: 'Intrastate Sale',
    message: 'Sale remains within state borders. Verify compliance with your specific state small-farm poultry/rabbit exemptions.'
  };
}
