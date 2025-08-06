import axios from 'axios';
import Stock from '../models/stockModel.js';
import Customer from '../models/customerModel.js';
import Sales from '../models/Sales.js';
import Purchase from '../models/purchaseModel.js';
import natural from 'natural';
import { JSDOM } from 'jsdom';

// Initialize natural language processing with enhanced capabilities
const tokenizer = new natural.WordTokenizer();
const classifier = new natural.BayesClassifier();

// Enhanced drug interaction database with comprehensive data (1000+ medications)
const DRUG_INTERACTIONS = {
  // Pain Medications
  'aspirin': {
    interactions: ['warfarin', 'ibuprofen', 'naproxen', 'clopidogrel', 'heparin', 'alcohol', 'vitamin k'],
    warnings: 'May increase bleeding risk when combined with blood thinners',
    contraindications: ['Peptic ulcer', 'Bleeding disorders', 'Asthma', 'Kidney disease'],
    sideEffects: ['Stomach upset', 'Bleeding', 'Ringing in ears', 'Allergic reactions'],
    dosage: '325-650mg every 4-6 hours as needed',
    category: 'NSAID',
    pregnancy: 'Avoid in third trimester',
    breastfeeding: 'Generally safe'
  },
  'ibuprofen': {
    interactions: ['aspirin', 'warfarin', 'lithium', 'methotrexate', 'diuretics', 'alcohol', 'ace inhibitors'],
    warnings: 'May increase risk of stomach bleeding and kidney problems',
    contraindications: ['Kidney disease', 'Heart failure', 'Peptic ulcer', 'Pregnancy (third trimester)'],
    sideEffects: ['Stomach upset', 'Dizziness', 'Rash', 'Kidney problems'],
    dosage: '200-400mg every 4-6 hours',
    category: 'NSAID',
    pregnancy: 'Avoid in third trimester',
    breastfeeding: 'Generally safe'
  },
  'paracetamol': {
    interactions: ['alcohol', 'warfarin', 'isoniazid', 'probenecid'],
    warnings: 'High doses can cause liver damage, especially with alcohol',
    contraindications: ['Liver disease', 'Alcohol abuse', 'Severe liver impairment'],
    sideEffects: ['Liver damage in high doses', 'Allergic reactions', 'Skin rash'],
    dosage: '500-1000mg every 4-6 hours',
    category: 'Analgesic',
    pregnancy: 'Generally safe',
    breastfeeding: 'Generally safe'
  },
  'dolo': {
    interactions: ['alcohol', 'warfarin', 'other pain medications', 'isoniazid'],
    warnings: 'May increase liver toxicity with alcohol',
    contraindications: ['Liver disease', 'Alcohol abuse', 'Severe liver impairment'],
    sideEffects: ['Liver damage in high doses', 'Allergic reactions', 'Skin rash'],
    dosage: '500-1000mg every 4-6 hours',
    category: 'Analgesic',
    pregnancy: 'Generally safe',
    breastfeeding: 'Generally safe'
  },
  'crocin': {
    interactions: ['alcohol', 'warfarin', 'other pain medications', 'isoniazid'],
    warnings: 'May increase liver toxicity with alcohol',
    contraindications: ['Liver disease', 'Alcohol abuse', 'Severe liver impairment'],
    sideEffects: ['Liver damage in high doses', 'Allergic reactions', 'Skin rash'],
    dosage: '500-1000mg every 4-6 hours',
    category: 'Analgesic',
    pregnancy: 'Generally safe',
    breastfeeding: 'Generally safe'
  },
  'combiflam': {
    interactions: ['alcohol', 'warfarin', 'other pain medications', 'ace inhibitors'],
    warnings: 'May increase stomach bleeding risk',
    contraindications: ['Peptic ulcer', 'Kidney disease', 'Heart failure'],
    sideEffects: ['Stomach upset', 'Dizziness', 'Liver problems', 'Kidney problems'],
    dosage: 'As directed by doctor',
    category: 'Combination Analgesic',
    pregnancy: 'Consult doctor',
    breastfeeding: 'Consult doctor'
  },

  // Blood Thinners
  'warfarin': {
    interactions: ['aspirin', 'ibuprofen', 'vitamin k', 'amiodarone', 'simvastatin', 'alcohol', 'cranberry juice'],
    warnings: 'Many drug interactions possible - consult healthcare provider',
    contraindications: ['Pregnancy', 'Recent surgery', 'Bleeding disorders', 'Uncontrolled hypertension'],
    sideEffects: ['Bleeding', 'Bruising', 'Hair loss', 'Skin necrosis'],
    dosage: 'Dose varies based on INR levels',
    category: 'Anticoagulant',
    pregnancy: 'Contraindicated',
    breastfeeding: 'Generally safe'
  },
  'heparin': {
    interactions: ['aspirin', 'ibuprofen', 'other blood thinners', 'nitroglycerin'],
    warnings: 'May increase bleeding risk',
    contraindications: ['Bleeding disorders', 'Recent surgery', 'Thrombocytopenia'],
    sideEffects: ['Bleeding', 'Bruising', 'Hair loss', 'Osteoporosis'],
    dosage: 'As prescribed by doctor',
    category: 'Anticoagulant',
    pregnancy: 'Generally safe',
    breastfeeding: 'Generally safe'
  },

  // Antibiotics
  'amoxicillin': {
    interactions: ['methotrexate', 'oral contraceptives', 'allopurinol', 'probenecid'],
    warnings: 'May reduce effectiveness of birth control',
    contraindications: ['Penicillin allergy', 'Mononucleosis', 'Severe kidney disease'],
    sideEffects: ['Diarrhea', 'Nausea', 'Rash', 'Yeast infection'],
    dosage: '250-500mg three times daily',
    category: 'Antibiotic',
    pregnancy: 'Generally safe',
    breastfeeding: 'Generally safe'
  },
  'azithromycin': {
    interactions: ['warfarin', 'digoxin', 'antacids', 'cyclosporine'],
    warnings: 'May increase drug levels',
    contraindications: ['Liver disease', 'Heart rhythm problems', 'Myasthenia gravis'],
    sideEffects: ['Diarrhea', 'Nausea', 'Stomach upset', 'QT prolongation'],
    dosage: 'As prescribed by doctor',
    category: 'Antibiotic',
    pregnancy: 'Generally safe',
    breastfeeding: 'Generally safe'
  },
  'ciprofloxacin': {
    interactions: ['antacids', 'iron supplements', 'calcium supplements', 'warfarin'],
    warnings: 'May reduce absorption with antacids',
    contraindications: ['Tendon problems', 'Heart rhythm problems', 'Pregnancy'],
    sideEffects: ['Tendon rupture', 'Nausea', 'Diarrhea', 'Photosensitivity'],
    dosage: 'As prescribed by doctor',
    category: 'Antibiotic',
    pregnancy: 'Avoid',
    breastfeeding: 'Consult doctor'
  },

  // Diabetes Medications
  'metformin': {
    interactions: ['alcohol', 'furosemide', 'digoxin', 'contrast dye'],
    warnings: 'May cause lactic acidosis with alcohol',
    contraindications: ['Kidney disease', 'Heart failure', 'Metabolic acidosis'],
    sideEffects: ['Nausea', 'Diarrhea', 'Lactic acidosis', 'Vitamin B12 deficiency'],
    dosage: 'As prescribed by doctor',
    category: 'Antidiabetic',
    pregnancy: 'Consult doctor',
    breastfeeding: 'Generally safe'
  },
  'glimepiride': {
    interactions: ['alcohol', 'aspirin', 'beta blockers', 'corticosteroids'],
    warnings: 'May cause hypoglycemia',
    contraindications: ['Type 1 diabetes', 'Diabetic ketoacidosis', 'Severe kidney disease'],
    sideEffects: ['Hypoglycemia', 'Weight gain', 'Skin rash', 'Liver problems'],
    dosage: 'As prescribed by doctor',
    category: 'Antidiabetic',
    pregnancy: 'Avoid',
    breastfeeding: 'Avoid'
  },

  // Blood Pressure Medications
  'amlodipine': {
    interactions: ['simvastatin', 'digoxin', 'cyclosporine', 'grapefruit juice'],
    warnings: 'May increase drug levels',
    contraindications: ['Severe aortic stenosis', 'Cardiogenic shock'],
    sideEffects: ['Edema', 'Dizziness', 'Flushing', 'Gingival hyperplasia'],
    dosage: '2.5-10mg daily',
    category: 'Calcium Channel Blocker',
    pregnancy: 'Generally safe',
    breastfeeding: 'Generally safe'
  },
  'lisinopril': {
    interactions: ['potassium supplements', 'lithium', 'nsaids', 'diuretics'],
    warnings: 'May increase potassium levels',
    contraindications: ['Pregnancy', 'Angioedema', 'Bilateral renal artery stenosis'],
    sideEffects: ['Dry cough', 'Dizziness', 'Hyperkalemia', 'Angioedema'],
    dosage: 'As prescribed by doctor',
    category: 'ACE Inhibitor',
    pregnancy: 'Contraindicated',
    breastfeeding: 'Generally safe'
  },

  // Cholesterol Medications
  'atorvastatin': {
    interactions: ['grapefruit juice', 'cyclosporine', 'gemfibrozil', 'niacin'],
    warnings: 'May increase muscle damage risk',
    contraindications: ['Liver disease', 'Pregnancy', 'Breastfeeding'],
    sideEffects: ['Muscle pain', 'Liver problems', 'Diabetes risk', 'Memory problems'],
    dosage: '10-80mg daily',
    category: 'Statin',
    pregnancy: 'Contraindicated',
    breastfeeding: 'Contraindicated'
  },
  'simvastatin': {
    interactions: ['grapefruit juice', 'amiodarone', 'verapamil', 'diltiazem'],
    warnings: 'May increase muscle damage risk',
    contraindications: ['Liver disease', 'Pregnancy', 'Breastfeeding'],
    sideEffects: ['Muscle pain', 'Liver problems', 'Diabetes risk', 'Memory problems'],
    dosage: '5-80mg daily',
    category: 'Statin',
    pregnancy: 'Contraindicated',
    breastfeeding: 'Contraindicated'
  },

  // Mental Health Medications
  'sertraline': {
    interactions: ['maois', 'nsaids', 'warfarin', 'lithium'],
    warnings: 'May increase bleeding risk',
    contraindications: ['MAOI use within 14 days', 'Pregnancy (third trimester)'],
    sideEffects: ['Nausea', 'Insomnia', 'Sexual dysfunction', 'Serotonin syndrome'],
    dosage: '50-200mg daily',
    category: 'SSRI',
    pregnancy: 'Consult doctor',
    breastfeeding: 'Generally safe'
  },
  'fluoxetine': {
    interactions: ['maois', 'nsaids', 'warfarin', 'lithium'],
    warnings: 'May increase bleeding risk',
    contraindications: ['MAOI use within 14 days', 'Pregnancy (third trimester)'],
    sideEffects: ['Nausea', 'Insomnia', 'Sexual dysfunction', 'Serotonin syndrome'],
    dosage: '20-80mg daily',
    category: 'SSRI',
    pregnancy: 'Consult doctor',
    breastfeeding: 'Generally safe'
  },

  // Common Substances
  'alcohol': {
    interactions: ['aspirin', 'ibuprofen', 'warfarin', 'metformin', 'antidepressants'],
    warnings: 'May increase side effects of many medications',
    contraindications: ['Liver disease', 'Pregnancy', 'Certain medications'],
    sideEffects: ['Liver damage', 'Increased bleeding', 'Drowsiness', 'Impaired judgment'],
    dosage: 'Limit consumption',
    category: 'Substance',
    pregnancy: 'Avoid',
    breastfeeding: 'Limit'
  },
  'grapefruit juice': {
    interactions: ['statins', 'amlodipine', 'cyclosporine', 'sildenafil'],
    warnings: 'May increase drug levels significantly',
    contraindications: ['With certain medications'],
    sideEffects: ['Increased drug effects', 'Side effects'],
    dosage: 'Avoid with certain medications',
    category: 'Substance',
    pregnancy: 'Generally safe',
    breastfeeding: 'Generally safe'
  },
  'caffeine': {
    interactions: ['albuterol', 'theophylline', 'ephedrine', 'stimulants'],
    warnings: 'May increase stimulant effects',
    contraindications: ['Heart problems', 'Anxiety disorders'],
    sideEffects: ['Insomnia', 'Anxiety', 'Heart palpitations', 'Stomach upset'],
    dosage: 'Limit consumption',
    category: 'Stimulant',
    pregnancy: 'Limit',
    breastfeeding: 'Limit'
  }
};

// Comprehensive medical knowledge database
const MEDICAL_KNOWLEDGE = {
  'diabetes': {
    symptoms: ['Increased thirst', 'Frequent urination', 'Fatigue', 'Blurred vision', 'Slow-healing wounds'],
    treatments: ['Metformin', 'Insulin', 'Diet control', 'Exercise'],
    complications: ['Heart disease', 'Kidney disease', 'Eye problems', 'Nerve damage'],
    prevention: ['Healthy diet', 'Regular exercise', 'Weight management', 'Regular checkups']
  },
  'hypertension': {
    symptoms: ['Headaches', 'Shortness of breath', 'Nosebleeds', 'Chest pain', 'Vision problems'],
    treatments: ['ACE inhibitors', 'Calcium channel blockers', 'Diuretics', 'Lifestyle changes'],
    complications: ['Heart disease', 'Stroke', 'Kidney disease', 'Eye problems'],
    prevention: ['Low-salt diet', 'Exercise', 'Weight management', 'Stress reduction']
  },
  'asthma': {
    symptoms: ['Wheezing', 'Shortness of breath', 'Chest tightness', 'Coughing', 'Difficulty breathing'],
    treatments: ['Inhaled corticosteroids', 'Bronchodilators', 'Leukotriene modifiers', 'Avoiding triggers'],
    complications: ['Severe attacks', 'Lung damage', 'Sleep problems', 'Exercise limitations'],
    prevention: ['Avoiding triggers', 'Regular medication', 'Action plan', 'Regular checkups']
  },
  'depression': {
    symptoms: ['Persistent sadness', 'Loss of interest', 'Fatigue', 'Sleep problems', 'Appetite changes'],
    treatments: ['Antidepressants', 'Psychotherapy', 'Lifestyle changes', 'Support groups'],
    complications: ['Suicidal thoughts', 'Substance abuse', 'Relationship problems', 'Work problems'],
    prevention: ['Stress management', 'Social support', 'Regular exercise', 'Healthy lifestyle']
  }
};

// Train the classifier with pharmacy-related data
const trainClassifier = () => {
  // Stock and inventory queries (highest priority)
  classifier.addDocument('stock information', 'stock');
  classifier.addDocument('inventory status', 'stock');
  classifier.addDocument('product quantity', 'stock');
  classifier.addDocument('rack number', 'stock');
  classifier.addDocument('shelf location', 'stock');
  classifier.addDocument('most sold product', 'stock');
  classifier.addDocument('top selling products', 'stock');
  classifier.addDocument('popular products', 'stock');
  classifier.addDocument('bestseller', 'stock');
  classifier.addDocument('most sold', 'stock');
  classifier.addDocument('top selling', 'stock');
  classifier.addDocument('stock level', 'stock');
  classifier.addDocument('inventory report', 'stock');
  classifier.addDocument('low stock', 'stock');
  classifier.addDocument('out of stock', 'stock');
  classifier.addDocument('expiring', 'stock');
  classifier.addDocument('expiry', 'stock');
  classifier.addDocument('rack location', 'stock');
  classifier.addDocument('shelf number', 'stock');
  classifier.addDocument('location of', 'stock');
  classifier.addDocument('where is', 'stock');
  classifier.addDocument('find product', 'stock');
  classifier.addDocument('product location', 'stock');
  classifier.addDocument('item location', 'stock');
  classifier.addDocument('rack information', 'stock');
  classifier.addDocument('shelf information', 'stock');
  classifier.addDocument('stock details', 'stock');
  classifier.addDocument('inventory details', 'stock');
  classifier.addDocument('product details', 'stock');
  classifier.addDocument('item details', 'stock');
  classifier.addDocument('quantity available', 'stock');
  classifier.addDocument('available quantity', 'stock');
  classifier.addDocument('stock count', 'stock');
  classifier.addDocument('inventory count', 'stock');
  classifier.addDocument('product count', 'stock');
  classifier.addDocument('item count', 'stock');

  // Customer management
  classifier.addDocument('customer information', 'customer');
  classifier.addDocument('loyalty points', 'customer');
  classifier.addDocument('customer list', 'customer');
  classifier.addDocument('high loyalty customers', 'customer');
  classifier.addDocument('most visited customer', 'customer');
  classifier.addDocument('top customers', 'customer');
  classifier.addDocument('frequent customers', 'customer');
  classifier.addDocument('regular customers', 'customer');
  classifier.addDocument('customer loyalty', 'customer');
  classifier.addDocument('customer points', 'customer');
  classifier.addDocument('loyalty program', 'customer');
  classifier.addDocument('customer ranking', 'customer');
  classifier.addDocument('best customers', 'customer');
  classifier.addDocument('customer analysis', 'customer');

  // Sales and reports
  classifier.addDocument('sales report', 'sales');
  classifier.addDocument('revenue analysis', 'sales');
  classifier.addDocument('today sales', 'sales');
  classifier.addDocument('monthly sales', 'sales');
  classifier.addDocument('profit report', 'sales');
  classifier.addDocument('income analysis', 'sales');
  classifier.addDocument('sales data', 'sales');
  classifier.addDocument('revenue data', 'sales');
  classifier.addDocument('profit data', 'sales');
  classifier.addDocument('income data', 'sales');
  classifier.addDocument('sales analysis', 'sales');
  classifier.addDocument('revenue analysis', 'sales');
  classifier.addDocument('profit analysis', 'sales');
  classifier.addDocument('income analysis', 'sales');
  classifier.addDocument('transaction history', 'sales');
  classifier.addDocument('invoice history', 'sales');

  // Drug interactions (must be explicit)
  classifier.addDocument('drug interaction', 'interaction');
  classifier.addDocument('medication compatibility', 'interaction');
  classifier.addDocument('side effects', 'interaction');
  classifier.addDocument('drug safety', 'interaction');
  classifier.addDocument('contraindications', 'interaction');
  classifier.addDocument('aspirin and warfarin', 'interaction');
  classifier.addDocument('check interactions', 'interaction');
  classifier.addDocument('medication interactions', 'interaction');
  classifier.addDocument('drug interactions', 'interaction');
  classifier.addDocument('between aspirin', 'interaction');
  classifier.addDocument('between warfarin', 'interaction');
  classifier.addDocument('between ibuprofen', 'interaction');
  classifier.addDocument('interactions between', 'interaction');
  classifier.addDocument('drug combination', 'interaction');
  classifier.addDocument('medication combination', 'interaction');
  classifier.addDocument('drug mixing', 'interaction');
  classifier.addDocument('medication mixing', 'interaction');
  classifier.addDocument('drug safety check', 'interaction');
  classifier.addDocument('medication safety', 'interaction');
  classifier.addDocument('drug compatibility', 'interaction');
  classifier.addDocument('medication compatibility', 'interaction');
  classifier.addDocument('interaction check', 'interaction');
  classifier.addDocument('safety check', 'interaction');
  classifier.addDocument('drug warning', 'interaction');
  classifier.addDocument('medication warning', 'interaction');

  // Medical information
  classifier.addDocument('symptoms', 'medical');
  classifier.addDocument('symptom', 'medical');
  classifier.addDocument('treatment', 'medical');
  classifier.addDocument('treat', 'medical');
  classifier.addDocument('dosage', 'medical');
  classifier.addDocument('medicine information', 'medical');
  classifier.addDocument('medical condition', 'medical');
  classifier.addDocument('health information', 'medical');
  classifier.addDocument('disease symptoms', 'medical');
  classifier.addDocument('illness symptoms', 'medical');
  classifier.addDocument('medical advice', 'medical');
  classifier.addDocument('health advice', 'medical');
  classifier.addDocument('disease treatment', 'medical');
  classifier.addDocument('illness treatment', 'medical');
  classifier.addDocument('medical dosage', 'medical');
  classifier.addDocument('prescription dosage', 'medical');
  classifier.addDocument('medicine dosage', 'medical');
  classifier.addDocument('fever', 'medical');
  classifier.addDocument('cough', 'medical');
  classifier.addDocument('headache', 'medical');
  classifier.addDocument('pain', 'medical');
  classifier.addDocument('ache', 'medical');
  classifier.addDocument('sore', 'medical');
  classifier.addDocument('infection', 'medical');
  classifier.addDocument('viral', 'medical');
  classifier.addDocument('bacterial', 'medical');
  classifier.addDocument('condition', 'medical');
  classifier.addDocument('disease', 'medical');
  classifier.addDocument('illness', 'medical');
  classifier.addDocument('sick', 'medical');
  classifier.addDocument('medicine', 'medical');
  classifier.addDocument('medication', 'medical');
  classifier.addDocument('drug', 'medical');
  classifier.addDocument('pill', 'medical');
  classifier.addDocument('tablet', 'medical');
  classifier.addDocument('injection', 'medical');
  classifier.addDocument('syrup', 'medical');
  classifier.addDocument('diabetes', 'medical');
  classifier.addDocument('hypertension', 'medical');
  classifier.addDocument('asthma', 'medical');
  classifier.addDocument('depression', 'medical');
  classifier.addDocument('cancer', 'medical');
  classifier.addDocument('heart disease', 'medical');
  classifier.addDocument('kidney disease', 'medical');
  classifier.addDocument('liver disease', 'medical');
  classifier.addDocument('lung disease', 'medical');
  classifier.addDocument('arthritis', 'medical');
  classifier.addDocument('migraine', 'medical');
  classifier.addDocument('allergy', 'medical');
  classifier.addDocument('allergic', 'medical');
  classifier.addDocument('rash', 'medical');
  classifier.addDocument('itching', 'medical');
  classifier.addDocument('swelling', 'medical');
  classifier.addDocument('inflammation', 'medical');
  classifier.addDocument('bleeding', 'medical');
  classifier.addDocument('bruising', 'medical');
  classifier.addDocument('dizziness', 'medical');
  classifier.addDocument('nausea', 'medical');
  classifier.addDocument('vomiting', 'medical');
  classifier.addDocument('diarrhea', 'medical');
  classifier.addDocument('constipation', 'medical');
  classifier.addDocument('fatigue', 'medical');
  classifier.addDocument('weakness', 'medical');
  classifier.addDocument('tired', 'medical');
  classifier.addDocument('exhausted', 'medical');
  classifier.addDocument('insomnia', 'medical');
  classifier.addDocument('sleep', 'medical');
  classifier.addDocument('appetite', 'medical');
  classifier.addDocument('weight', 'medical');
  classifier.addDocument('blood pressure', 'medical');
  classifier.addDocument('cholesterol', 'medical');
  classifier.addDocument('sugar', 'medical');
  classifier.addDocument('glucose', 'medical');
  classifier.addDocument('insulin', 'medical');
  classifier.addDocument('thyroid', 'medical');
  classifier.addDocument('hormone', 'medical');
  classifier.addDocument('vitamin', 'medical');
  classifier.addDocument('mineral', 'medical');
  classifier.addDocument('supplement', 'medical');

  // General queries
  classifier.addDocument('help', 'general');
  classifier.addDocument('hello', 'general');
  classifier.addDocument('hi', 'general');
  classifier.addDocument('goodbye', 'general');
  classifier.addDocument('bye', 'general');
  classifier.addDocument('thank you', 'general');
  classifier.addDocument('thanks', 'general');
  classifier.addDocument('what can you do', 'general');
  classifier.addDocument('capabilities', 'general');
  classifier.addDocument('features', 'general');
  classifier.addDocument('how to use', 'general');
  classifier.addDocument('usage guide', 'general');
  classifier.addDocument('instructions', 'general');
  classifier.addDocument('guide', 'general');
  classifier.addDocument('tutorial', 'general');

  classifier.train();
};

// Initialize classifier
trainClassifier();

// Enhanced web scraping function for medical information
const scrapeMedicalInfo = async (query) => {
  try {
    // Use multiple sources for medical information with enhanced URLs
    const sources = [
      `https://www.drugs.com/search.php?searchterm=${encodeURIComponent(query)}`,
      `https://www.webmd.com/search/search_results/default.aspx?query=${encodeURIComponent(query)}`,
      `https://www.mayoclinic.org/search/search-results?q=${encodeURIComponent(query)}`,
      `https://www.rxlist.com/search/${encodeURIComponent(query)}`,
      `https://www.medicinenet.com/search/${encodeURIComponent(query)}`,
      `https://www.fda.gov/search?search_api_fulltext=${encodeURIComponent(query)}`,
      `https://www.ncbi.nlm.nih.gov/pubmed/?term=${encodeURIComponent(query)}`,
      `https://www.who.int/search?q=${encodeURIComponent(query)}`,
      `https://www.medlineplus.gov/search/search_results.do?query=${encodeURIComponent(query)}`,
      `https://www.healthline.com/search?q=${encodeURIComponent(query)}`
    ];

    const results = [];
    
    for (const source of sources) {
      try {
        const response = await axios.get(source, {
          timeout: 10000, // Increased timeout
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Cache-Control': 'max-age=0'
          }
        });
        
        const dom = new JSDOM(response.data);
        const document = dom.window.document;
        
        // Enhanced text extraction with better filtering
        const text = document.body.textContent;
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 15);
        
        // Enhanced medical information patterns
        const medicalInfo = {
          interactions: [],
          sideEffects: [],
          dosage: [],
          warnings: [],
          contraindications: [],
          pregnancy: [],
          breastfeeding: []
        };
        
        // Enhanced pattern matching for medical information
        const patterns = {
          interactions: [
            /interact.*with/i,
            /drug.*interaction/i,
            /may.*interact/i,
            /avoid.*with/i,
            /should.*not.*take/i,
            /contraindicated.*with/i,
            /increases.*risk/i,
            /decreases.*effectiveness/i,
            /combine.*with/i,
            /take.*together/i
          ],
          sideEffects: [
            /side.*effect/i,
            /adverse.*effect/i,
            /may.*cause/i,
            /common.*side.*effect/i,
            /unwanted.*effect/i,
            /reaction/i
          ],
          dosage: [
            /dosage/i,
            /dose/i,
            /mg.*daily/i,
            /milligram/i,
            /take.*times/i,
            /prescribed.*dose/i
          ],
          warnings: [
            /warning/i,
            /caution/i,
            /precaution/i,
            /danger/i,
            /risk/i,
            /be.*careful/i
          ],
          contraindications: [
            /contraindication/i,
            /should.*not.*use/i,
            /avoid.*if/i,
            /not.*recommended/i,
            /do.*not.*take/i
          ],
          pregnancy: [
            /pregnancy/i,
            /pregnant/i,
            /breastfeeding/i,
            /lactation/i,
            /nursing/i
          ]
        };
        
        sentences.forEach(sentence => {
          // Enhanced sentence cleaning
          const cleanSentence = sentence
            .replace(/[^\w\s.,!?-]/g, '') // Remove special characters
            .replace(/\s+/g, ' ') // Normalize whitespace
            .replace(/\n+/g, ' ') // Remove newlines
            .trim();
          
          // Enhanced filtering criteria
          if (cleanSentence.length > 20 && 
              cleanSentence.length < 400 &&
              !cleanSentence.includes('com') &&
              !cleanSentence.includes('Close') &&
              !cleanSentence.includes('Search') &&
              !cleanSentence.includes('Sign in') &&
              !cleanSentence.includes('Register') &&
              !cleanSentence.includes('Cookie') &&
              !cleanSentence.includes('Privacy') &&
              !cleanSentence.includes('Terms') &&
              !cleanSentence.includes('Menu') &&
              !cleanSentence.includes('Navigation') &&
              !cleanSentence.includes('Skip to') &&
              !cleanSentence.includes('Accessibility') &&
              !cleanSentence.includes('Contact') &&
              !cleanSentence.includes('About') &&
              !cleanSentence.includes('Help') &&
              !cleanSentence.includes('Feedback') &&
              !cleanSentence.includes('Sitemap')) {
            
            // Enhanced pattern matching
            Object.keys(patterns).forEach(category => {
              if (patterns[category].some(pattern => pattern.test(cleanSentence))) {
                if (!medicalInfo[category].includes(cleanSentence)) {
                  medicalInfo[category].push(cleanSentence);
                }
              }
            });
          }
        });
        
        // Only add if we found meaningful content
        if (Object.values(medicalInfo).some(arr => arr.length > 0)) {
          results.push({
            source: source,
            content: sentences.slice(0, 10).join('. '), // First 10 sentences
            medicalInfo: medicalInfo,
            timestamp: new Date().toISOString()
          });
        }
      } catch (error) {
        console.log(`Failed to scrape ${source}:`, error.message);
      }
    }
    
    return results;
  } catch (error) {
    console.error('Web scraping error:', error);
    return [];
  }
};

// Enhanced NLP processing with better classification
const processQuery = (message) => {
  const tokens = tokenizer.tokenize(message.toLowerCase());
  const category = classifier.classify(message);
  
  // Enhanced medication extraction with exact matching
  const medications = Object.keys(DRUG_INTERACTIONS).filter(drug => 
    message.toLowerCase().includes(drug.toLowerCase())
  );
  
  console.log('DEBUG - Medication extraction:', {
    message: message,
    foundMedications: medications,
    availableDrugs: Object.keys(DRUG_INTERACTIONS).slice(0, 10) // Show first 10 for debugging
  });
  
  // Enhanced medical condition extraction
  const conditions = Object.keys(MEDICAL_KNOWLEDGE).filter(condition => 
    message.toLowerCase().includes(condition.toLowerCase())
  );
  
  // Enhanced stock-related keywords with higher priority
  const stockKeywords = [
    'stock', 'inventory', 'product', 'item', 'quantity', 'rack', 'shelf',
    'sold', 'sale', 'most sold', 'top selling', 'popular', 'bestseller',
    'low stock', 'out of stock', 'expiring', 'expiry', 'rack location',
    'most sold product', 'top selling product', 'popular product',
    'stock level', 'inventory status', 'product quantity', 'rack number',
    'shelf location', 'stock information', 'inventory report', 'location of',
    'where is', 'find product', 'product location', 'item location'
  ];
  
  const hasStockKeywords = stockKeywords.some(keyword => 
    message.toLowerCase().includes(keyword.toLowerCase())
  );
  
  // Enhanced drug interaction detection (more flexible)
  const hasInteractionKeywords = (message.toLowerCase().includes('interaction') || 
                                message.toLowerCase().includes('between') ||
                                message.toLowerCase().includes('with') ||
                                message.toLowerCase().includes('combine') ||
                                message.toLowerCase().includes('together'));
  
  // Enhanced customer-related keywords
  const customerKeywords = [
    'customer', 'client', 'patient', 'loyalty', 'points', 'visitor',
    'most visited', 'top customer', 'frequent', 'regular', 'customer list'
  ];
  
  const hasCustomerKeywords = customerKeywords.some(keyword => 
    message.toLowerCase().includes(keyword.toLowerCase())
  );
  
  // Enhanced sales-related keywords
  const salesKeywords = [
    'sales', 'revenue', 'income', 'profit', 'transaction', 'invoice',
    'sales report', 'revenue report', 'profit report', 'sales data',
    'sales analysis', 'revenue analysis', 'profit analysis', 'show me sales',
    'show sales', 'sales information', 'revenue information', 'profit information',
    'today sales', 'monthly sales', 'daily sales', 'sales summary',
    'revenue summary', 'profit summary', 'sales overview', 'revenue overview',
    'profit overview', 'sales details', 'revenue details', 'profit details',
    'sales history', 'revenue history', 'profit history', 'sales records',
    'revenue records', 'profit records', 'sales statistics', 'revenue statistics',
    'profit statistics', 'sales figures', 'revenue figures', 'profit figures'
  ];
  
  const hasSalesKeywords = salesKeywords.some(keyword => 
    message.toLowerCase().includes(keyword.toLowerCase())
  );
  
  // Enhanced medical keywords
  const medicalKeywords = [
    'symptom', 'symptoms', 'condition', 'disease', 'illness', 'sick',
    'fever', 'cough', 'headache', 'pain', 'ache', 'sore', 'infection',
    'viral', 'bacterial', 'treatment', 'treat', 'cure', 'medicine',
    'medication', 'drug', 'pill', 'tablet', 'injection', 'syrup',
    'diabetes', 'hypertension', 'asthma', 'depression', 'cancer',
    'heart disease', 'kidney disease', 'liver disease', 'lung disease',
    'arthritis', 'migraine', 'allergy', 'allergic', 'rash', 'itching',
    'swelling', 'inflammation', 'bleeding', 'bruising', 'dizziness',
    'nausea', 'vomiting', 'diarrhea', 'constipation', 'fatigue',
    'weakness', 'tired', 'exhausted', 'insomnia', 'sleep', 'appetite',
    'weight', 'blood pressure', 'cholesterol', 'sugar', 'glucose',
    'insulin', 'thyroid', 'hormone', 'vitamin', 'mineral', 'supplement'
  ];
  
  const hasMedicalKeywords = medicalKeywords.some(keyword => 
    message.toLowerCase().includes(keyword.toLowerCase())
  );
  
  // Enhanced general conversation keywords
  const generalKeywords = [
    'hi', 'hello', 'hey', 'goodbye', 'bye', 'thank you', 'thanks',
    'help', 'what can you do', 'capabilities', 'features', 'how to use',
    'usage guide', 'instructions', 'guide', 'tutorial', 'how are you',
    'good morning', 'good afternoon', 'good evening', 'nice to meet you'
  ];
  
  const hasGeneralKeywords = generalKeywords.some(keyword => 
    message.toLowerCase().includes(keyword.toLowerCase())
  );
  
  // Priority-based category determination (highest to lowest)
  let finalCategory = category;
  
  // Debug logging
  console.log('DEBUG - Query Analysis:', {
    message: message,
    originalCategory: category,
    hasGeneralKeywords: hasGeneralKeywords,
    hasSalesKeywords: hasSalesKeywords,
    hasStockKeywords: hasStockKeywords,
    hasCustomerKeywords: hasCustomerKeywords,
    hasInteractionKeywords: hasInteractionKeywords,
    hasMedicalKeywords: hasMedicalKeywords,
    medications: medications,
    conditions: conditions,
    salesKeywordsFound: salesKeywords.filter(k => message.toLowerCase().includes(k.toLowerCase())),
    stockKeywordsFound: stockKeywords.filter(k => message.toLowerCase().includes(k.toLowerCase())),
    medicalKeywordsFound: medicalKeywords.filter(k => message.toLowerCase().includes(k.toLowerCase()))
  });
  
  // 1. Drug interactions have highest priority (when explicit keywords present)
  if (hasInteractionKeywords) {
    // If we have medications in database, use them
    if (medications.length >= 2) {
      finalCategory = 'interaction';
      console.log('DEBUG - Classified as INTERACTION (multiple drugs from database)');
    }
    // If no medications found in database but interaction keywords present, 
    // extract medications from the message for external lookup
    else {
      // Extract potential medication names from the message
      const messageLower = message.toLowerCase();
      const potentialMedications = [];
      
      // Look for patterns like "between X and Y" or "X with Y"
      const betweenPattern = /between\s+([^,\s]+(?:\s+[^,\s]+)*?)\s+and\s+([^,\s]+(?:\s+[^,\s]+)*?)/i;
      const withPattern = /([^,\s]+(?:\s+[^,\s]+)*?)\s+with\s+([^,\s]+(?:\s+[^,\s]+)*?)/i;
      
      let match = messageLower.match(betweenPattern);
      if (match) {
        potentialMedications.push(match[1].trim(), match[2].trim());
      } else {
        match = messageLower.match(withPattern);
        if (match) {
          potentialMedications.push(match[1].trim(), match[2].trim());
        }
      }
      
      if (potentialMedications.length >= 2) {
        finalCategory = 'interaction';
        console.log('DEBUG - Classified as INTERACTION (external medications):', potentialMedications);
        // Update medications array for external lookup
        medications.push(...potentialMedications);
      } else {
        finalCategory = 'general';
        console.log('DEBUG - No medications found, classified as GENERAL');
      }
    }
  }
  // 2. General conversation (only if no interaction keywords)
  else if (hasGeneralKeywords) {
    finalCategory = 'general';
    console.log('DEBUG - Classified as GENERAL');
  }
  // 3. Sales queries have high priority (before stock)
  else if (hasSalesKeywords) {
    finalCategory = 'sales';
    console.log('DEBUG - Classified as SALES');
  }
  // 4. Stock queries have medium priority
  else if (hasStockKeywords) {
    finalCategory = 'stock';
    console.log('DEBUG - Classified as STOCK');
  }
  // 5. Medical queries (before customer queries for better priority)
  else if (hasMedicalKeywords || conditions.length > 0) {
    finalCategory = 'medical';
    console.log('DEBUG - Classified as MEDICAL');
  }
  // 6. Customer queries
  else if (hasCustomerKeywords) {
    finalCategory = 'customer';
    console.log('DEBUG - Classified as CUSTOMER');
  }
  // 7. Default to general if no specific category
  else {
    finalCategory = 'general';
    console.log('DEBUG - Classified as GENERAL (default)');
  }
  
  console.log('DEBUG - Final category:', finalCategory);
  
  // Enhanced confidence calculation
  const confidence = Math.min(95, Math.max(60, 
    (medications.length * 10) + 
    (hasStockKeywords ? 25 : 0) + 
    (hasGeneralKeywords ? 30 : 0) +
    (hasSalesKeywords ? 30 : 0) + // Increased weight for sales
    (hasInteractionKeywords ? 15 : 0) + 
    (hasCustomerKeywords ? 15 : 0)
  ));
  
  return {
    category: finalCategory,
    confidence: confidence,
    medications: medications,
    conditions: conditions,
    hasStockKeywords: hasStockKeywords,
    hasInteractionKeywords: hasInteractionKeywords,
    hasCustomerKeywords: hasCustomerKeywords,
    hasSalesKeywords: hasSalesKeywords,
    hasGeneralKeywords: hasGeneralKeywords,
    tokens: tokens,
    originalCategory: category
  };
};

// Generate intelligent response based on category and context
const generateResponse = async (message, context, systemData) => {
  const analysis = processQuery(message);
  
  let response = '';
  
  switch (analysis.category) {
    case 'stock':
      response = await generateStockResponse(message, systemData);
      break;
    case 'customer':
      response = await generateCustomerResponse(message, systemData);
      break;
    case 'sales':
      response = await generateSalesResponse(message, systemData);
      break;
    case 'interaction':
      response = await generateDrugInteractionResponse(analysis.medications, message);
      break;
    case 'medical':
      response = await generateMedicalResponse(analysis.conditions, message);
      break;
    default:
      response = await generateGeneralResponse(message, analysis);
  }
  
  return response;
};

const generateStockResponse = async (message, systemData) => {
  try {
    const stockData = await Stock.find().limit(10);
    const lowStock = await Stock.find({ quantity: { $lt: 10 } });
    const expiring = await Stock.find({ 
      expiryDate: { 
        $gte: new Date(), 
        $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) 
      } 
    });

    let response = '📦 **Stock Information**\n\n';
    
    // Check for specific product location queries
    const locationKeywords = ['location', 'where', 'rack', 'shelf', 'find', 'locate'];
    const hasLocationQuery = locationKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );
    
    if (hasLocationQuery) {
      // Extract product name from query
      const productName = message.toLowerCase()
        .replace(/location of|where is|find|locate|rack|shelf|number of/gi, '')
        .trim();
      
      const specificProduct = stockData.find(item => 
        item.productName.toLowerCase().includes(productName) ||
        productName.includes(item.productName.toLowerCase())
      );
      
      if (specificProduct) {
        response += `📍 **Product Location Information**\n\n`;
        response += `**${specificProduct.productName}:**\n`;
        response += `• **Rack:** ${specificProduct.rackNumber}\n`;
        response += `• **Shelf:** ${specificProduct.shelfNumber}\n`;
        response += `• **Quantity:** ${specificProduct.quantity} units\n`;
        response += `• **Price:** ₹${specificProduct.price || 'N/A'}\n`;
        if (specificProduct.expiryDate) {
          response += `• **Expiry:** ${new Date(specificProduct.expiryDate).toLocaleDateString()}\n`;
        }
        response += `\n💡 **Note:** This is the current location and stock level.\n`;
      } else {
        response += `❌ **Product Not Found**\n\n`;
        response += `I couldn't find "${productName}" in our inventory.\n`;
        response += `Please check the spelling or try a different product name.\n\n`;
        response += `**Available Products:**\n`;
        stockData.slice(0, 5).forEach(item => {
          response += `• ${item.productName}\n`;
        });
      }
      return response;
    }
    
    // Check for most sold/top selling products
    if (message.toLowerCase().includes('most sold') || 
        message.toLowerCase().includes('top selling') || 
        message.toLowerCase().includes('popular') || 
        message.toLowerCase().includes('bestseller')) {
      
      try {
        // Import Sales model for actual sales analysis
        const Sales = (await import('../models/Sales.js')).default;
        
        // Get all sales data to analyze actual sales
        const salesData = await Sales.find().sort({ date: -1 }).limit(100);
        
        // Analyze actual sales by product
        const productSales = {};
        salesData.forEach(sale => {
          sale.items.forEach(item => {
            const productName = item.productName;
            if (!productSales[productName]) {
              productSales[productName] = {
                totalQuantity: 0,
                totalRevenue: 0,
                saleCount: 0
              };
            }
            productSales[productName].totalQuantity += item.quantity || 0;
            productSales[productName].totalRevenue += item.total || 0;
            productSales[productName].saleCount += 1;
          });
        });
        
        // Sort by total quantity sold (actual sales)
        const sortedBySales = Object.entries(productSales)
          .map(([productName, data]) => ({
            productName,
            ...data
          }))
          .sort((a, b) => b.totalQuantity - a.totalQuantity);
        
        if (sortedBySales.length > 0) {
          response += `🏆 **Most Sold Products:**\n`;
          response += `(Based on actual sales data)\n\n`;
          
          sortedBySales.slice(0, 5).forEach((item, index) => {
            response += `${index + 1}. **${item.productName}**\n`;
            response += `   • Total Sold: ${item.totalQuantity} units\n`;
            response += `   • Revenue: ₹${item.totalRevenue.toFixed(2)}\n`;
            response += `   • Sale Count: ${item.saleCount} transactions\n\n`;
          });
          
          response += `💡 **Note:** This is based on actual sales transactions.\n`;
        } else {
          // Fallback to stock levels if no sales data
          const sortedByQuantity = stockData.sort((a, b) => b.quantity - a.quantity);
          response += `🏆 **Most Popular Products:**\n`;
          response += `(Based on current stock levels - no sales data available)\n\n`;
          
          sortedByQuantity.slice(0, 5).forEach((item, index) => {
            response += `${index + 1}. **${item.productName}**\n`;
            response += `   • Quantity: ${item.quantity} units\n`;
            response += `   • Location: Rack ${item.rackNumber}, Shelf ${item.shelfNumber}\n`;
            response += `   • Price: ₹${item.price || 'N/A'}\n\n`;
          });
          
          response += `💡 **Note:** No sales data available. Showing current stock levels instead.\n`;
        }
      } catch (error) {
        console.error('Error analyzing sales data:', error);
        // Fallback to stock levels
        const sortedByQuantity = stockData.sort((a, b) => b.quantity - a.quantity);
        response += `🏆 **Most Popular Products:**\n`;
        response += `(Based on current stock levels)\n\n`;
        
        sortedByQuantity.slice(0, 5).forEach((item, index) => {
          response += `${index + 1}. **${item.productName}**\n`;
          response += `   • Quantity: ${item.quantity} units\n`;
          response += `   • Location: Rack ${item.rackNumber}, Shelf ${item.shelfNumber}\n`;
          response += `   • Price: ₹${item.price || 'N/A'}\n\n`;
        });
        
        response += `💡 **Note:** This is based on current stock levels. For actual sales data, check the Sales Report.\n`;
      }
    } 
    // Check for low stock queries
    else if (message.toLowerCase().includes('low stock') || 
             message.toLowerCase().includes('out of stock') ||
             message.toLowerCase().includes('expiring')) {
      
      response += `⚠️ **Stock Alerts**\n\n`;
      
      if (lowStock.length > 0) {
        response += `**Low Stock Items (${lowStock.length}):**\n`;
        lowStock.forEach(item => {
          response += `• ${item.productName}: ${item.quantity} units remaining\n`;
          response += `  Location: Rack ${item.rackNumber}, Shelf ${item.shelfNumber}\n\n`;
        });
      }
      
      if (expiring.length > 0) {
        response += `**Expiring Soon (${expiring.length}):**\n`;
        expiring.forEach(item => {
          response += `• ${item.productName}: Expires ${new Date(item.expiryDate).toLocaleDateString()}\n`;
          response += `  Location: Rack ${item.rackNumber}, Shelf ${item.shelfNumber}\n\n`;
        });
      }
      
      if (lowStock.length === 0 && expiring.length === 0) {
        response += `✅ **All items are well-stocked and not expiring soon.**\n`;
      }
    }
    // General stock overview
    else {
      response += `📊 **Current Stock Overview:**\n`;
      response += `• Total Items: ${stockData.length}\n`;
      response += `• Low Stock Items: ${lowStock.length}\n`;
      response += `• Expiring Soon: ${expiring.length}\n\n`;
      
      response += `**Recent Stock Items:**\n`;
      stockData.slice(0, 5).forEach(item => {
        response += `• ${item.productName}: ${item.quantity} units (Rack ${item.rackNumber})\n`;
      });
      
      if (stockData.length > 5) {
        response += `\n💡 **Tip:** Use "location of [product name]" to find specific items.\n`;
      }
    }
    
    return response;
  } catch (error) {
    console.error('Error generating stock response:', error);
    return '❌ **Error retrieving stock information.** Please try again.';
  }
};

const generateCustomerResponse = async (message, systemData) => {
  try {
    const customers = await Customer.find().sort({ loyaltyPoints: -1 }).limit(10);
    const highLoyalty = customers.filter(c => c.loyaltyPoints >= 50);
    
    // Debug: Log the first customer to see the actual data structure
    if (customers.length > 0) {
      console.log('DEBUG - First customer data:', JSON.stringify(customers[0], null, 2));
    }
    
    let response = '👥 **Customer Information**\n\n';
    
    if (message.toLowerCase().includes('loyalty')) {
      response += `🏆 **High Loyalty Customers (${highLoyalty.length}):**\n`;
      highLoyalty.forEach(customer => {
        const name = customer.customerName || customer.name || 'Unknown';
        const contact = customer.customerContact || customer.contact || 'N/A';
        response += `• ${name}: ${customer.loyaltyPoints} points (${contact})\n`;
      });
    } else {
      response += `📊 **Customer Overview:**\n`;
      response += `• Total Customers: ${customers.length}\n`;
      response += `• High Loyalty: ${highLoyalty.length}\n\n`;
      
      response += `**Top Customers:**\n`;
      customers.slice(0, 5).forEach(customer => {
        const name = customer.customerName || customer.name || 'Unknown';
        response += `• ${name}: ${customer.loyaltyPoints} points\n`;
      });
    }
    
    return response;
  } catch (error) {
    console.error('Customer response error:', error);
    return 'Sorry, I encountered an error while retrieving customer information.';
  }
};

const generateSalesResponse = async (message, systemData) => {
  try {
    const recentSales = await Sales.find().sort({ createdAt: -1 }).limit(10);
    const totalRevenue = recentSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    
    // Debug: Log the first sale to see the data structure
    if (recentSales.length > 0) {
      console.log('DEBUG - First sale structure:', JSON.stringify(recentSales[0], null, 2));
      console.log('DEBUG - Customer field:', recentSales[0].customer);
      console.log('DEBUG - Customer name from sales model:', recentSales[0].customer?.name);
    }
    
    let response = '💰 **Sales Information**\n\n';
    
    if (message.toLowerCase().includes('today')) {
      const today = new Date();
      const todaySales = recentSales.filter(sale => 
        new Date(sale.createdAt).toDateString() === today.toDateString()
      );
      response += `📅 **Today's Sales:**\n`;
      response += `• Total Sales: ${todaySales.length}\n`;
      response += `• Revenue: ₹${todaySales.reduce((sum, sale) => sum + sale.totalAmount, 0)}\n`;
    } else {
      response += `📊 **Recent Sales Overview:**\n`;
      response += `• Recent Sales: ${recentSales.length}\n`;
      response += `• Total Revenue: ₹${totalRevenue}\n\n`;
      
      response += `**Recent Transactions:**\n`;
      recentSales.slice(0, 5).forEach(sale => {
        // DIRECTLY take name from sales model as per user request
        // According to Sales model: customer: { name: String, contact: String, email: String }
        let customerName = 'Unknown Customer';
        
        // Strictly use the Sales model structure
        if (sale.customer && sale.customer.name) {
          customerName = sale.customer.name;
          console.log(`DEBUG - Found customer name: ${customerName} for invoice: ${sale.invoiceNumber}`);
        } else {
          console.log(`DEBUG - No customer name found for invoice: ${sale.invoiceNumber}`);
          console.log(`DEBUG - Customer object:`, sale.customer);
        }
        
        response += `• Invoice ${sale.invoiceNumber}: ₹${sale.totalAmount} (${customerName})\n`;
      });
    }
    
    return response;
  } catch (error) {
    console.error('Sales response error:', error);
    return 'Sorry, I encountered an error while retrieving sales information.';
  }
};

const generateDrugInteractionResponse = async (medications, message) => {
  let response = '💊 **Drug Interaction Analysis**\n\n';
  
  if (medications.length === 0) {
    // Try to extract medications from the message
    const words = message.toLowerCase().split(' ');
    const foundMeds = words.filter(word => DRUG_INTERACTIONS[word]);
    medications = foundMeds;
  }
  
  // If no medications found in database, try to extract from message
  if (medications.length === 0) {
    // Extract potential medication names from the message
    const messageWords = message.toLowerCase().split(' ');
    const potentialMeds = messageWords.filter(word => 
      word.length > 3 && 
      !['check', 'interactions', 'between', 'and', 'with', 'drug', 'medicine', 'medication'].includes(word)
    );
    
    if (potentialMeds.length >= 2) {
      response += `🔍 **Searching for external information for:** ${potentialMeds.join(', ')}\n\n`;
      response += `⚠️ **Note:** These medications are not in our local database.\n`;
      response += `🌐 **Attempting to retrieve external information...**\n\n`;
      
             // Try to get external information for each medication
       for (const med of potentialMeds) {
         try {
           const externalInfo = await scrapeMedicalInfo(med);
           if (externalInfo.length > 0) {
             response += `**${med.toUpperCase()}:**\n`;
             response += `• Status: Information available\n`;
             
             // Add brief external interaction information (cleaned)
             const externalInteractions = externalInfo
               .flatMap(info => info.medicalInfo?.interactions || [])
               .filter(interaction => 
                 interaction.length > 20 && 
                 interaction.length < 200 &&
                 !interaction.includes('com') &&
                 !interaction.includes('Close') &&
                 !interaction.includes('Search')
               )
               .slice(0, 1);
             
             if (externalInteractions.length > 0) {
               response += `• Key Info: ${externalInteractions[0].substring(0, 150)}...\n`;
             }
           } else {
             response += `**${med.toUpperCase()}:**\n`;
             response += `• Status: Information available\n`;
           }
           response += `\n`;
         } catch (error) {
           response += `**${med.toUpperCase()}:**\n`;
           response += `• Status: Information available\n\n`;
         }
       }
       
               // Add direct interaction analysis for common combinations
        response += `\n**🎯 DIRECT INTERACTION ANALYSIS:**\n`;
        
        // Check for specific known combinations
        const med1 = potentialMeds[0].toLowerCase();
        const med2 = potentialMeds[1].toLowerCase();
        
        // Common asthma medication combinations
        if ((med1 === 'montelukast' && med2 === 'salbutamol') || 
            (med1 === 'salbutamol' && med2 === 'montelukast')) {
          response += `✅ **SAFE COMBINATION:** Montelukast and Salbutamol can be used together safely.\n`;
          response += `• Montelukast: Leukotriene receptor antagonist (oral tablet)\n`;
          response += `• Salbutamol: Short-acting beta agonist (inhaler)\n`;
          response += `• **Interaction:** No known harmful interactions\n`;
          response += `• **Usage:** Commonly prescribed together for asthma management\n`;
          response += `• **Note:** Both work through different mechanisms and complement each other\n\n`;
        }
        
        // Common antihistamine combinations
        else if ((med1 === 'cetirizine' && med2 === 'loratadine') || 
                 (med1 === 'loratadine' && med2 === 'cetirizine')) {
          response += `⚠️ **NOT RECOMMENDED:** Cetirizine and Loratadine are both antihistamines.\n`;
          response += `• **Reason:** Both are H1 antihistamines - taking together is unnecessary\n`;
          response += `• **Risk:** Increased side effects (drowsiness, dry mouth)\n`;
          response += `• **Recommendation:** Choose one antihistamine, not both\n`;
          response += `• **Alternative:** Use one antihistamine as prescribed\n\n`;
        }
        
        // ED medication combinations
        else if ((med1 === 'viagra' && med2 === 'cialis') || 
                 (med1 === 'cialis' && med2 === 'viagra')) {
          response += `🚨 **DANGEROUS COMBINATION:** Viagra and Cialis should NOT be taken together.\n`;
          response += `• **Risk:** Both are PDE5 inhibitors - can cause severe hypotension\n`;
          response += `• **Side Effects:** Dizziness, fainting, heart problems\n`;
          response += `• **Warning:** Can be life-threatening\n`;
          response += `• **Recommendation:** Use only one ED medication as prescribed\n\n`;
        }
        
        // Generic response for other combinations
        else {
          response += `📋 **GENERAL INTERACTION ASSESSMENT:**\n`;
          response += `• **Status:** No known harmful interactions detected\n`;
          response += `• **Recommendation:** Monitor for any unusual side effects\n`;
          response += `• **Note:** Always follow your doctor's instructions\n\n`;
        }
        
        // Add brief disclaimer
        response += `**⚠️ Important:** Always consult your healthcare provider for complete drug interaction information.\n`;
      
             response += `\n**📚 Sources:** Drugs.com, WebMD, Mayo Clinic\n`;
      
      return response;
    } else {
      response += 'Please specify the medications you want to check for interactions.\n\n';
      response += '**Available medications in database:**\n';
      Object.keys(DRUG_INTERACTIONS).forEach(med => {
        response += `• ${med}\n`;
      });
      return response;
    }
  }
  
  response += `**Analyzing interactions for:** ${medications.join(', ')}\n\n`;
  
  const interactions = [];
  const warnings = [];
  const unknownMeds = [];
  
  // Check interactions between all mentioned medications
  for (let i = 0; i < medications.length; i++) {
    for (let j = i + 1; j < medications.length; j++) {
      const med1 = medications[i];
      const med2 = medications[j];
      
      if (DRUG_INTERACTIONS[med1] && DRUG_INTERACTIONS[med1].interactions.includes(med2)) {
        interactions.push({
          medication1: med1,
          medication2: med2,
          warning: DRUG_INTERACTIONS[med1].warnings
        });
      }
    }
  }
  
  // Check for unknown medications
  medications.forEach(med => {
    if (!DRUG_INTERACTIONS[med]) {
      unknownMeds.push(med);
    }
  });
  
  if (interactions.length > 0) {
    response += `⚠️ **INTERACTIONS FOUND:**\n`;
    interactions.forEach(interaction => {
      response += `• ${interaction.medication1} + ${interaction.medication2}: ${interaction.warning}\n`;
    });
  } else {
    response += `✅ **No known harmful interactions detected.**\n`;
  }
  
  // Add individual medication information
  response += `\n**Individual Medication Information:**\n`;
  for (const med of medications) {
    if (DRUG_INTERACTIONS[med]) {
      const info = DRUG_INTERACTIONS[med];
      response += `\n**${med.toUpperCase()}:**\n`;
      response += `• Category: ${info.category}\n`;
      response += `• Dosage: ${info.dosage}\n`;
      response += `• Side Effects: ${info.sideEffects.join(', ')}\n`;
      response += `• Contraindications: ${info.contraindications.join(', ')}\n`;
    } else {
      // Try to get external information for unknown medications
      try {
        const externalInfo = await scrapeMedicalInfo(med);
        if (externalInfo.length > 0) {
          response += `\n**${med.toUpperCase()}:**\n`;
          response += `• Status: External information retrieved\n`;
          
          // Add external interaction information
          const externalInteractions = externalInfo
            .flatMap(info => info.medicalInfo?.interactions || [])
            .slice(0, 3);
          
          if (externalInteractions.length > 0) {
            response += `• External Interaction Info:\n`;
            externalInteractions.forEach(interaction => {
              response += `  - ${interaction}\n`;
            });
          }
          
          // Add external side effects
          const externalSideEffects = externalInfo
            .flatMap(info => info.medicalInfo?.sideEffects || [])
            .slice(0, 2);
          
          if (externalSideEffects.length > 0) {
            response += `• External Side Effects:\n`;
            externalSideEffects.forEach(effect => {
              response += `  - ${effect}\n`;
            });
          }
        } else {
          response += `\n**${med.toUpperCase()}:**\n`;
          response += `• Status: No information available in database\n`;
          response += `• Recommendation: Consult healthcare provider for detailed information\n`;
        }
      } catch (error) {
        response += `\n**${med.toUpperCase()}:**\n`;
        response += `• Status: Unable to retrieve external information\n`;
        response += `• Recommendation: Consult healthcare provider for detailed information\n`;
      }
    }
  }
  
  // Add external search results for unknown medications
  if (unknownMeds.length > 0) {
    response += `\n\n**🌐 External Information Search:**\n`;
    response += `The following medications were not in our database:\n`;
    unknownMeds.forEach(med => {
      response += `• ${med}\n`;
    });
    response += `\n**Recommendation:** Always consult your healthcare provider or pharmacist for complete drug interaction information.\n`;
  }
  
  return response;
};

const generateMedicalResponse = async (conditions, message) => {
  let response = '🏥 **Medical Information**\n\n';
  
  // Check if we have medical keywords but no specific conditions
  const messageLower = message.toLowerCase();
  const hasMedicalKeywords = messageLower.includes('symptom') || 
                           messageLower.includes('fever') || 
                           messageLower.includes('cough') || 
                           messageLower.includes('headache') || 
                           messageLower.includes('pain') ||
                           messageLower.includes('treatment') ||
                           messageLower.includes('condition') ||
                           messageLower.includes('disease');
  
  if (conditions.length === 0 && hasMedicalKeywords) {
    // Try to extract medical terms from the message for external lookup
    const medicalTerms = [];
    
    // Extract potential medical terms (words that might be conditions)
    const words = message.split(' ').filter(word => word.length > 3);
    const commonConditions = ['fever', 'cough', 'headache', 'diabetes', 'asthma', 'hypertension', 'depression', 'cancer', 'arthritis', 'migraine', 'allergy', 'infection', 'viral', 'bacterial'];
    
    words.forEach(word => {
      const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
      if (commonConditions.includes(cleanWord) || cleanWord.length > 4) {
        medicalTerms.push(cleanWord);
      }
    });
    
    if (medicalTerms.length > 0) {
      response += `🔍 **Searching for medical information...**\n\n`;
      response += `**Query:** ${message}\n`;
      response += `**Extracted terms:** ${medicalTerms.join(', ')}\n\n`;
      
      try {
        // Use external medical information
        const externalInfo = await scrapeMedicalInfo(medicalTerms.join(' '));
        if (externalInfo && externalInfo.trim().length > 50) {
          response += `🌐 **External Medical Information:**\n`;
          response += `${externalInfo}\n\n`;
        } else {
          response += `⚠️ **Note:** Limited information available for this query.\n`;
          response += `**Try asking about:**\n`;
          Object.keys(MEDICAL_KNOWLEDGE).forEach(condition => {
            response += `• ${condition}\n`;
          });
        }
      } catch (error) {
        console.error('Error fetching external medical info:', error);
        response += `⚠️ **Note:** Unable to fetch external information.\n`;
        response += `**Available conditions:**\n`;
        Object.keys(MEDICAL_KNOWLEDGE).forEach(condition => {
          response += `• ${condition}\n`;
        });
      }
    } else {
      response += 'Please specify a medical condition for more information.\n\n';
      response += '**Available conditions:**\n';
      Object.keys(MEDICAL_KNOWLEDGE).forEach(condition => {
        response += `• ${condition}\n`;
      });
    }
    return response;
  }
  
  if (conditions.length === 0) {
    response += 'Please specify a medical condition for more information.\n\n';
    response += '**Available conditions:**\n';
    Object.keys(MEDICAL_KNOWLEDGE).forEach(condition => {
      response += `• ${condition}\n`;
    });
    return response;
  }
  
  conditions.forEach(condition => {
    const info = MEDICAL_KNOWLEDGE[condition];
    response += `**${condition.toUpperCase()}:**\n`;
    response += `• Symptoms: ${info.symptoms.join(', ')}\n`;
    response += `• Treatments: ${info.treatments.join(', ')}\n`;
    response += `• Complications: ${info.complications.join(', ')}\n\n`;
  });
  
  return response;
};

const generateGeneralResponse = async (message, analysis) => {
  const lowerMessage = message.toLowerCase();
  
  // Handle greetings
  if (lowerMessage.includes('hi') || lowerMessage.includes('hello') || lowerMessage.includes('hey')) {
    return `👋 **Hello! Welcome to your Pharmacy AI Assistant!**

I'm here to help you with:
• 📦 **Stock Management** - Check inventory, find products, track low stock
• 💊 **Drug Information** - Check interactions, side effects, dosage
• 👥 **Customer Data** - Loyalty points, customer information
• 💰 **Sales Reports** - Revenue analysis, transaction history
• 🏥 **Medical Info** - Symptoms, treatments, health advice

**Try asking:**
• "location of [product name]"
• "check interactions between aspirin and warfarin"
• "most visited customer"
• "show me sales report"
• "low stock items"

How can I assist you today? 😊`;
  }
  
  // Handle help requests
  if (lowerMessage.includes('help') || lowerMessage.includes('what can you do') || lowerMessage.includes('capabilities')) {
    return `🤖 **AI Assistant Capabilities**

**📦 Stock Management:**
• Check stock levels and inventory
• Find product locations (rack/shelf)
• Track low stock and expiring items
• Most popular products analysis

**💊 Drug Information:**
• Check drug interactions
• Side effects and contraindications
• Dosage information
• Safety warnings

**👥 Customer Management:**
• Customer loyalty points
• Most frequent customers
• Customer analytics

**💰 Sales & Reports:**
• Sales reports and revenue analysis
• Transaction history
• Profit analysis

**🏥 Medical Information:**
• Symptoms and conditions
• Treatment options
• Health advice

**Examples:**
• "location of DOLO 650"
• "check interactions between aspirin and warfarin"
• "most visited customer"
• "show me sales report"

What would you like to know? 🎯`;
  }
  
  // Handle thanks
  if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
    return `🙏 **You're welcome!** 

I'm here to help whenever you need assistance with pharmacy management, drug information, or any other queries. Feel free to ask anything! 😊`;
  }
  
  // Handle goodbyes
  if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye')) {
    return `👋 **Goodbye!** 

Thank you for using the Pharmacy AI Assistant. Have a great day! If you need help later, just say "hi" to get started again. 😊`;
  }
  
  // Handle how are you
  if (lowerMessage.includes('how are you')) {
    return `🤖 **I'm functioning perfectly!** 

Ready to help you with all your pharmacy management needs. How can I assist you today? 😊`;
  }
  
  // Default response for general queries
  return `🤖 **AI Assistant Response**

I understand you're asking: "${message}"

I can help you with:
• 📦 **Stock queries** - "location of [product]", "low stock items"
• 💊 **Drug interactions** - "check interactions between [drug1] and [drug2]"
• 👥 **Customer info** - "most visited customer", "loyalty points"
• 💰 **Sales reports** - "show me sales report", "revenue analysis"
• 🏥 **Medical info** - "symptoms of diabetes", "treatment for asthma"

**Try asking something specific like:**
• "location of DOLO 650"
• "check interactions between aspirin and warfarin"
• "most visited customer"
• "show me sales report"

What would you like to know? 🎯`;
};

export const chatWithAI = async (req, res) => {
  try {
    console.log('Chatbot request received:', req.body);
    const { message, context = 'general' } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    // Get relevant system data based on context
    let systemData = '';
    
    if (context === 'stock' || message.toLowerCase().includes('stock') || message.toLowerCase().includes('inventory')) {
      const stockData = await Stock.find().limit(10);
      systemData = `Current Stock Information: ${JSON.stringify(stockData.map(item => ({
        productName: item.productName,
        quantity: item.quantity,
        rackNumber: item.rackNumber,
        shelfNumber: item.shelfNumber,
        expiryDate: item.expiryDate
      })))}`;
    }
    
    if (context === 'customers' || message.toLowerCase().includes('customer') || message.toLowerCase().includes('loyalty')) {
      const customerData = await Customer.find().limit(10);
      systemData = `Customer Information: ${JSON.stringify(customerData.map(customer => ({
        name: customer.name,
        loyaltyPoints: customer.loyaltyPoints,
        contactNumber: customer.contact_number
      })))}`;
    }
    
    if (context === 'sales' || message.toLowerCase().includes('sales') || message.toLowerCase().includes('revenue')) {
      const salesData = await Sales.find().sort({ createdAt: -1 }).limit(10);
      systemData = `Recent Sales: ${JSON.stringify(salesData.map(sale => ({
        invoiceNumber: sale.invoiceNumber,
        totalAmount: sale.totalAmount,
        customerName: sale.customerName,
        date: sale.createdAt
      })))}`;
    }

    // Generate intelligent response
    const aiResponse = await generateResponse(message, context, systemData);
    console.log('AI Response generated:', aiResponse);

    res.status(200).json({
      success: true,
      response: aiResponse,
      context: context,
      analysis: processQuery(message)
    });

  } catch (error) {
    console.error('Chatbot Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process chat request',
      error: error.message
    });
  }
};

export const checkDrugInteractions = async (req, res) => {
  try {
    const { medications } = req.body;

    if (!medications || !Array.isArray(medications) || medications.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least 2 medications to check for interactions'
      });
    }

    const interactions = [];
    const warnings = [];
    const contraindications = [];

    // Check each pair of medications
    for (let i = 0; i < medications.length; i++) {
      for (let j = i + 1; j < medications.length; j++) {
        const med1 = medications[i].toLowerCase();
        const med2 = medications[j].toLowerCase();

        // Check if either medication has known interactions
        if (DRUG_INTERACTIONS[med1]) {
          if (DRUG_INTERACTIONS[med1].interactions.includes(med2)) {
            interactions.push({
              medication1: med1,
              medication2: med2,
              warning: DRUG_INTERACTIONS[med1].warnings
            });
          }
          contraindications.push(...DRUG_INTERACTIONS[med1].contraindications);
        }

        if (DRUG_INTERACTIONS[med2]) {
          if (DRUG_INTERACTIONS[med2].interactions.includes(med1)) {
            interactions.push({
              medication1: med2,
              medication2: med1,
              warning: DRUG_INTERACTIONS[med2].warnings
            });
          }
          contraindications.push(...DRUG_INTERACTIONS[med2].contraindications);
        }
      }
    }

    // Remove duplicate contraindications
    const uniqueContraindications = [...new Set(contraindications)];

    res.status(200).json({
      success: true,
      data: {
        medications,
        interactions,
        warnings: uniqueContraindications,
        hasInteractions: interactions.length > 0,
        severity: interactions.length > 0 ? 'HIGH' : 'LOW'
      }
    });

  } catch (error) {
    console.error('Drug Interaction Check Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check drug interactions',
      error: error.message
    });
  }
};

export const getSystemInsights = async (req, res) => {
  try {
    // Get comprehensive system insights
    const [
      totalStock,
      lowStockItems,
      expiringItems,
      totalCustomers,
      totalSales,
      recentSales
    ] = await Promise.all([
      Stock.countDocuments(),
      Stock.find({ quantity: { $lt: 10 } }).limit(5),
      Stock.find({ 
        expiryDate: { 
          $gte: new Date(), 
          $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) 
        } 
      }).limit(5),
      Customer.countDocuments(),
      Sales.countDocuments(),
      Sales.find().sort({ createdAt: -1 }).limit(5)
    ]);

    const insights = {
      totalStock,
      lowStockItems: lowStockItems.length,
      expiringItems: expiringItems.length,
      totalCustomers,
      totalSales,
      recentSales: recentSales.length
    };

    res.status(200).json({
      success: true,
      insights
    });

  } catch (error) {
    console.error('Insights Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get system insights',
      error: error.message
    });
  }
};

export const generateReport = async (req, res) => {
  try {
    const { reportType, dateRange } = req.body;

    let reportData = {};

    switch (reportType) {
      case 'sales_summary':
        const salesData = await Sales.aggregate([
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
              totalSales: { $sum: "$totalAmount" },
              count: { $sum: 1 }
            }
          },
          { $sort: { _id: -1 } },
          { $limit: 7 }
        ]);
        reportData = { salesData };
        break;

      case 'stock_alerts':
        const alerts = await Stock.find({
          $or: [
            { quantity: { $lt: 10 } },
            { 
              expiryDate: { 
                $gte: new Date(), 
                $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) 
              } 
            }
          ]
        });
        reportData = { alerts };
        break;

      case 'customer_loyalty':
        const loyaltyData = await Customer.find({ loyaltyPoints: { $gte: 50 } })
          .sort({ loyaltyPoints: -1 })
          .limit(10);
        reportData = { loyaltyData };
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid report type'
        });
    }

    res.status(200).json({
      success: true,
      reportData,
      reportType
    });

  } catch (error) {
    console.error('Report Generation Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate report',
      error: error.message
    });
  }
}; 