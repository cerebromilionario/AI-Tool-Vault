const fs = require("fs");
const tools = require("./data/tools.json");

const keywords = [
"youtube",
"students",
"marketing",
"coding",
"blogging",
"content creation",
"social media",
"seo",
"productivity",
"design"
];

const template = (keyword, toolsList) => `
<!DOCTYPE html>
<html>
<head>
<title>Best AI Tools for ${keyword}</title>
<meta name="description" content="Discover the best AI tools for ${keyword}. Compare the top artificial intelligence tools.">
</head>
<body>

<h1>Best AI Tools for ${keyword}</h1>

<p>Here are the best AI tools for ${keyword} in 2025.</p>

<ul>
${toolsList
.slice(0,10)
.map(
t => `<li><a href="/pages/alternatives/${t.slug}/">${t.name}</a></li>`
)
.join("")}
</ul>

</body>
</html>
`;

keywords.forEach(keyword => {

const dir = `./pages/best-ai-tools-for-${keyword.replace(/\s/g,"-")}`;

if (!fs.existsSync(dir)) fs.mkdirSync(dir,{recursive:true});

fs.writeFileSync(
`${dir}/index.html`,
template(keyword,tools)
);

});
