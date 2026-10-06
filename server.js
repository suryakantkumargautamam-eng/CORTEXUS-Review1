const http = require('http');
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'reviews.json');
const GOOGLE_REVIEW_URL = 'https://g.page/r/CRDpyce9iCusEBM/review';

// CORTEXUS logo embedded inside this single file.
const LOGO_BASE64 = 'data:image/jpeg;base64,' +
'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';

const PROBLEMS = [
  'Back Pain Treatment',
  'Neck Pain Treatment',
  'Knee Pain Treatment',
  'Sciatica Treatment',
  'Frozen Shoulder Treatment',
  'Stroke Rehabilitation',
  'Paralysis Rehabilitation',
  'Post Surgery Rehabilitation',
  'Neurological Physiotherapy',
  'Orthopedic Physiotherapy',
  'Sports Injury Rehabilitation',
  'Elderly Care Physiotherapy'
];

const EXPERIENCES = {
  improvement: {
    en: 'I noticed improvement in my condition.',
    hi: 'Meri condition mein improvement notice hui.'
  },
  movement: {
    en: 'My movement became better.',
    hi: 'Meri movement pehle se better hui.'
  },
  pain: {
    en: 'My pain or discomfort improved.',
    hi: 'Mera pain ya discomfort improve hua.'
  },
  explanation: {
    en: 'The exercises were explained clearly.',
    hi: 'Exercises mujhe clearly samjhaye gaye.'
  },
  professional: {
    en: 'The treatment felt professional.',
    hi: 'Treatment kaafi professional laga.'
  },
  communication: {
    en: 'Communication was good.',
    hi: 'Communication achhi rahi.'
  },
  patient: {
    en: 'The therapist was patient and supportive.',
    hi: 'Therapist patient aur supportive rahe.'
  },
  guidance: {
    en: 'I received proper guidance during exercises.',
    hi: 'Exercises ke dauran proper guidance mili.'
  }
};

const OPENINGS = {
  'Back Pain Treatment': {
    en: 'I visited CORTEXUS for back pain treatment and had a positive experience.',
    hi: 'Back pain treatment ke liye CORTEXUS gaya aur mera experience achha raha.'
  },
  'Neck Pain Treatment': {
    en: 'I visited CORTEXUS for neck pain treatment and had a positive experience.',
    hi: 'Neck pain treatment ke liye CORTEXUS gaya aur mera experience achha raha.'
  },
  'Knee Pain Treatment': {
    en: 'I visited CORTEXUS for knee pain treatment and had a positive experience.',
    hi: 'Knee pain treatment ke liye CORTEXUS gaya aur mera experience achha raha.'
  },
  'Sciatica Treatment': {
    en: 'I visited CORTEXUS for sciatica treatment and had a positive experience.',
    hi: 'Sciatica treatment ke liye CORTEXUS gaya aur mera experience achha raha.'
  },
  'Frozen Shoulder Treatment': {
    en: 'I visited CORTEXUS for frozen shoulder treatment and had a positive experience.',
    hi: 'Frozen shoulder treatment ke liye CORTEXUS gaya aur mera experience achha raha.'
  },
  'Stroke Rehabilitation': {
    en: 'I visited CORTEXUS for stroke rehabilitation and had a positive experience.',
    hi: 'Stroke rehabilitation ke liye CORTEXUS gaya aur mera experience achha raha.'
  },
  'Paralysis Rehabilitation': {
    en: 'I visited CORTEXUS for paralysis rehabilitation and had a positive experience.',
    hi: 'Paralysis rehabilitation ke liye CORTEXUS gaya aur mera experience achha raha.'
  },
  'Post Surgery Rehabilitation': {
    en: 'I visited CORTEXUS for post-surgery rehabilitation and had a positive experience.',
    hi: 'Post-surgery rehabilitation ke liye CORTEXUS gaya aur mera experience achha raha.'
  },
  'Neurological Physiotherapy': {
    en: 'I visited CORTEXUS for neurological physiotherapy and had a positive experience.',
    hi: 'Neurological physiotherapy ke liye CORTEXUS gaya aur mera experience achha raha.'
  },
  'Orthopedic Physiotherapy': {
    en: 'I visited CORTEXUS for orthopedic physiotherapy and had a positive experience.',
    hi: 'Orthopedic physiotherapy ke liye CORTEXUS gaya aur mera experience achha raha.'
  },
  'Sports Injury Rehabilitation': {
    en: 'I visited CORTEXUS for sports injury rehabilitation and had a positive experience.',
    hi: 'Sports injury rehabilitation ke liye CORTEXUS gaya aur mera experience achha raha.'
  },
  'Elderly Care Physiotherapy': {
    en: 'I visited CORTEXUS for elderly care physiotherapy and had a positive experience.',
    hi: 'Elderly care physiotherapy ke liye CORTEXUS gaya aur mera experience achha raha.'
  }
};
const LOGO_DATA = 'data:image/jpeg;base64,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';

function loadDatabase() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify({ reviews: [] }, null, 2));
    }
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch (e) {
    return { reviews: [] };
  }
}

function saveDatabase(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

function hashReview(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const ENDINGS = {
  en: [
    'Overall, I had a good experience with CORTEXUS.',
    'Overall, the experience was positive.',
    'I was satisfied with my experience at CORTEXUS.'
  ],
  hi: [
    'Overall, CORTEXUS ke saath mera experience achha raha.',
    'Overall experience positive raha.',
    'Main CORTEXUS ke treatment experience se satisfied raha.'
  ]
};

function makeReview(problem, selected, language) {
  const lang = language === 'hi' ? 'hi' : 'en';
  const sentences = selected.map(key => EXPERIENCES[key][lang]);

  return [
    OPENINGS[problem][lang],
    ...sentences,
    pick(ENDINGS[lang])
  ].join(' ');
}

function generateUniqueReview(problem, selected, language) {
  const db = loadDatabase();

  for (let attempt = 0; attempt < 100; attempt++) {
    const shuffled = [...selected].sort(() => Math.random() - 0.5);
    const review = makeReview(problem, shuffled, language);
    const hash = hashReview(review);

    const alreadyUsed = db.reviews.some(item => item.hash === hash);

    if (!alreadyUsed) {
      db.reviews.push({
        hash,
        problem,
        language,
        experiences: shuffled,
        review,
        createdAt: new Date().toISOString()
      });

      saveDatabase(db);
      return review;
    }
  }

  return null;
}

function send(res, status, body, contentType = 'text/html; charset=utf-8') {
  res.writeHead(status, {
    'Content-Type': contentType,
    'Cache-Control': 'no-store'
  });
  res.end(body);
}

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>CORTEXUS Review</title>

<style>
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: #f4f6f8;
  color: #17202a;
  font-family: Arial, Helvetica, sans-serif;
}

.page {
  width: 100%;
  max-width: 780px;
  margin: 0 auto;
  padding: 18px;
}

.card {
  background: #ffffff;
  border-radius: 20px;
  padding: 25px;
  box-shadow: 0 6px 30px rgba(0,0,0,0.08);
}

.logo {
  display: block;
  width: 100%;
  max-width: 390px;
  height: auto;
  margin: 0 auto 10px;
  object-fit: contain;
}

h1 {
  text-align: center;
  font-size: 26px;
  margin: 8px 0;
}

.subtitle {
  text-align: center;
  color: #667085;
  line-height: 1.5;
  margin-bottom: 25px;
}

h2 {
  font-size: 18px;
  margin: 25px 0 12px;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.choice {
  display: block;
  border: 1px solid #d9dee5;
  border-radius: 12px;
  padding: 13px;
  background: #fff;
  cursor: pointer;
  transition: 0.15s;
}

.choice:hover {
  background: #f7faff;
  border-color: #1976d2;
}

.choice input {
  margin-right: 8px;
}

.language {
  display: flex;
  gap: 10px;
}

.language label {
  flex: 1;
}

.language input {
  display: none;
}

.language span {
  display: block;
  text-align: center;
  border: 1px solid #d9dee5;
  border-radius: 11px;
  padding: 12px;
  cursor: pointer;
}

.language input:checked + span {
  border-color: #1976d2;
  background: #eaf3ff;
}

button {
  width: 100%;
  border: 0;
  border-radius: 12px;
  padding: 15px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 18px;
}

.generate {
  background: #1976d2;
  color: #fff;
}

.copy {
  background: #18a558;
  color: #fff;
}

textarea {
  display: block;
  width: 100%;
  min-height: 190px;
  resize: vertical;
  margin-top: 14px;
  padding: 14px;
  border: 1px solid #d9dee5;
  border-radius: 12px;
  font-size: 15px;
  line-height: 1.55;
  font-family: Arial, Helvetica, sans-serif;
}

.note {
  color: #667085;
  font-size: 13px;
  line-height: 1.5;
  margin-top: 10px;
}

.footer {
  text-align: center;
  color: #667085;
  font-size: 13px;
  line-height: 1.5;
  margin-top: 20px;
}

@media (max-width: 600px) {
  .page {
    padding: 10px;
  }

  .card {
    padding: 18px;
  }

  .grid {
    grid-template-columns: 1fr;
  }

  h1 {
    font-size: 23px;
  }

  .logo {
    max-width: 330px;
  }
}
</style>
</head>

<body>
<div class="page">
<div class="card">

<img class="logo" src="${LOGO_DATA}" alt="CORTEXUS">

<h1>Thank You for Choosing CORTEXUS</h1>

<p class="subtitle">
Please select only the experiences that genuinely apply to your treatment.
</p>

<h2>1. What treatment did you receive?</h2>
<div id="problems" class="grid"></div>

<h2>2. What genuinely describes your experience?</h2>
<div id="experiences" class="grid"></div>

<h2>3. Review language</h2>

<div class="language">
<label>
<input type="radio" name="language" value="en" checked>
<span>English</span>
</label>

<label>
<input type="radio" name="language" value="hi">
<span>Hinglish</span>
</label>
</div>

<button class="generate" onclick="generateReview()">
GENERATE REVIEW
</button>

<textarea
id="review"
readonly
placeholder="Your review draft will appear here..."
></textarea>

<button class="copy" onclick="copyAndOpen()">
COPY REVIEW & OPEN GOOGLE REVIEW
</button>

<p class="note">
Please read the generated draft carefully. Only post it if it accurately
reflects your genuine experience. CORTEXUS does not automatically post reviews.
</p>

<div class="footer">
CORTEXUS • Rehab • Recovery • Performance<br>
Rebuilding Movement. Restoring Life.
</div>

</div>
</div>
`;
const clientScript = `
<script>
const problems = ${JSON.stringify(PROBLEMS)};
const experiences = ${JSON.stringify(
  Object.entries(EXPERIENCES).map(([id, value]) => ({
    id,
    en: value.en,
    hi: value.hi
  }))
)};

const googleReviewUrl = ${JSON.stringify(GOOGLE_REVIEW_URL)};

const problemsBox = document.getElementById('problems');
const experiencesBox = document.getElementById('experiences');

problems.forEach((problem, index) => {
  const label = document.createElement('label');
  label.className = 'choice';

  const input = document.createElement('input');
  input.type = 'radio';
  input.name = 'problem';
  input.value = problem;

  if (index === 0) {
    input.checked = true;
  }

  label.appendChild(input);
  label.appendChild(document.createTextNode(problem));
  problemsBox.appendChild(label);
});

function renderExperiences() {
  const language =
    document.querySelector('input[name="language"]:checked')?.value || 'en';

  experiencesBox.innerHTML = '';

  experiences.forEach(item => {
    const label = document.createElement('label');
    label.className = 'choice';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.name = 'experience';
    input.value = item.id;

    label.appendChild(input);

    const text = document.createTextNode(
      language === 'hi' ? item.hi : item.en
    );

    label.appendChild(text);
    experiencesBox.appendChild(label);
  });
}

document.querySelectorAll('input[name="language"]').forEach(radio => {
  radio.addEventListener('change', renderExperiences);
});

renderExperiences();

async function generateReview() {

  const problem =
    document.querySelector('input[name="problem"]:checked')?.value;

  const selectedExperiences =
    [...document.querySelectorAll('input[name="experience"]:checked')]
      .map(input => input.value);

  const language =
    document.querySelector('input[name="language"]:checked')?.value || 'en';

  if (!problem) {
    alert('Please select your treatment.');
    return;
  }

  if (selectedExperiences.length < 2) {
    alert('Please select at least 2 genuine experiences.');
    return;
  }

  const button = document.querySelector('.generate');

  button.disabled = true;
  button.textContent = 'GENERATING...';

  try {

    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        problem,
        experiences: selectedExperiences,
        language
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Unable to generate review.');
    }

    document.getElementById('review').value = data.review;

  } catch (error) {

    alert(error.message);

  } finally {

    button.disabled = false;
    button.textContent = 'GENERATE REVIEW';

  }
}

async function copyAndOpen() {

  const reviewBox = document.getElementById('review');
  const review = reviewBox.value.trim();

  if (!review) {
    alert('Please generate the review first.');
    return;
  }

  try {

    await navigator.clipboard.writeText(review);

    alert(
      'Review copied. Google Review page will open now. Please paste the review there and post it only if it is accurate.'
    );

    window.open(googleReviewUrl, '_blank');

  } catch (error) {

    reviewBox.focus();
    reviewBox.select();

    alert(
      'Automatic copy was not available. Please copy the selected review manually and then open Google Review.'
    );

  }
}
</script>
`;

const finalHTML = HTML.replace(
  '</body>',
  clientScript + '</body>'
);

function readRequestBody(req) {
  return new Promise((resolve, reject) => {

    let body = '';

    req.on('data', chunk => {
      body += chunk;

      if (body.length > 1000000) {
        req.destroy();
        reject(new Error('Request too large.'));
      }
    });

    req.on('end', () => {

      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error('Invalid JSON.'));
      }

    });

    req.on('error', reject);

  });
}

const server = http.createServer(async (req, res) => {

  // Main website
  if (req.method === 'GET' && req.url === '/') {

    send(res, 200, finalHTML);
    return;

  }

  // Health check
  if (req.method === 'GET' && req.url === '/health') {

    send(
      res,
      200,
      JSON.stringify({
        status: 'ok',
        service: 'CORTEXUS Review'
      }),
      'application/json; charset=utf-8'
    );

    return;

  }

  // Generate review
  if (req.method === 'POST' && req.url === '/api/generate') {

    try {

      const body = await readRequestBody(req);

      const problem = body.problem;
      const selectedExperiences = Array.isArray(body.experiences)
        ? body.experiences
        : [];

      const language = body.language === 'hi'
        ? 'hi'
        : 'en';

      if (!PROBLEMS.includes(problem)) {

        send(
          res,
          400,
          JSON.stringify({
            error: 'Please select a valid treatment.'
          }),
          'application/json; charset=utf-8'
        );

        return;
      }

      const validExperiences = selectedExperiences.filter(
        key => Object.prototype.hasOwnProperty.call(EXPERIENCES, key)
      );

      if (validExperiences.length < 2) {

        send(
          res,
          400,
          JSON.stringify({
            error: 'Please select at least 2 genuine experiences.'
          }),
          'application/json; charset=utf-8'
        );

        return;
      }

      const review = generateUniqueReview(
        problem,
        validExperiences,
        language
      );

      if (!review) {

        send(
          res,
          503,
          JSON.stringify({
            error: 'Please select a different combination of genuine experiences and try again.'
          }),
          'application/json; charset=utf-8'
        );

        return;
      }

      send(
        res,
        200,
        JSON.stringify({
          success: true,
          review
        }),
        'application/json; charset=utf-8'
      );

      return;

    } catch (error) {

      send(
        res,
        500,
        JSON.stringify({
          error: 'Server error. Please try again.'
        }),
        'application/json; charset=utf-8'
      );

      return;
    }
  }

  send(
    res,
    404,
    JSON.stringify({
      error: 'Not found'
    }),
    'application/json; charset=utf-8'
  );

});

server.listen(PORT, () => {
  console.log('CORTEXUS Review server running on port ' + PORT);
});
