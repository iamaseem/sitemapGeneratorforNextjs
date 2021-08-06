const {
  PrismaClient
} = require('@prisma/client');

const prisma = new PrismaClient();



const fs = require('fs');
const prettier = require('prettier');
const path = require('path');

async function getProject() {
  const allSlugs = await prisma.searchslug.findMany({
    select: {
      slug: true
    },
    take: 1000
  });
  let pathlist = [];
  allSlugs.forEach((path) => {
    pathlist.push(`/${path.slug}`);
  })
  return pathlist;
}

async function getAllProject() {
  const allSlugs = await prisma.searchslug.findMany({
    select: {
      slug: true
    }
  });
  let pathlist = [];
  allSlugs.forEach((path) => {
    pathlist.push(`/${path.slug}`);
  })
  return pathlist;
}

async function getPropertyDetails() {
  const propertySlug = await prisma.propertys.findMany({
    where: {
      status: 'Approved'
    },
    select: {
      propertySlug: true,
      id: true
    }
  });
  let detailsPath = [];
  let idPath = [];
  propertySlug.forEach(path => {
    let newSlug = path.propertySlug.replace(/[&\/\\#,+()$~%.'":*?<>{}@!]/g, '');
    detailsPath.push(`${newSlug}`)
  });
  propertySlug.forEach(id => {
    idPath.push(`${id.id}`);
  });
  return {
    detailsPath,
    idPath
  };
}

async function main() {
  const mainSitemap = [];
  const dirname = '../NextjsWebsite';
  const directoryPath = path.join(dirname, 'pages');
  const APP_URL = process.env.APP_URL;
  const formatted = sitemap => prettier.format(sitemap, {
    parser: "html"
  });

  const getDate = new Date().toISOString();

  const AllPaths = await getAllProject();
  const AllPropertyDetailsPath = await getPropertyDetails();


  const siteMapData1 = AllPaths
    .map(path => {
      return `
    <url>
      <loc>${APP_URL}${path}</loc>
      <lastmod>${getDate}</lastmod>
    </url>`;
    });

  for (let i = 0; i < siteMapData1.length; i += 1000) {
    let generatedSitemapSlice1 = '';
    let sitemapSlice = '';
    if (i + 1000 > siteMapData1.length) {
      console.log(siteMapData1.slice(i, siteMapData1.length).length)
      sitemapSlice = `${siteMapData1.slice(i, siteMapData1.length).join("")}`;
      generatedSitemapSlice1 = `<?xml version="1.0" encoding="UTF-8"?>
                                <urlset
                                xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
                                xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                                xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd"
                                >
                                ${sitemapSlice}
                                </urlset>`;
    } else {
      console.log(siteMapData1.slice(i, i + 1000).length)
      sitemapSlice = `${siteMapData1.slice(i, i+1000).join("")}`;
      generatedSitemapSlice1 = `<?xml version="1.0" encoding="UTF-8"?>
                                <urlset
                                xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
                                xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                                xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd"
                                >
                                ${sitemapSlice}
                                </urlset>`;
    }
    const formattedSitemap2 = formatted(generatedSitemapSlice1);
    fs.writeFileSync(`${dirname}/public/sitemap-search-${(i/1000)+1}.xml`, formattedSitemap2, "utf8");
    mainSitemap.push(`${APP_URL}/sitemap-search-${(i/1000)+1}.xml`);
  }

  const siteMapData2 = [];

  for (let i = 0; i < AllPropertyDetailsPath.detailsPath.length; i++) {
    siteMapData2.push(
      `<url>
        <loc>${APP_URL}/${AllPropertyDetailsPath.detailsPath[i]}/p/${AllPropertyDetailsPath.idPath[i]}</loc>
        <lastmod>${getDate}</lastmod>
      </url>`
    );
  }

  for (let i = 0; i < siteMapData2.length; i += 1000) {
    let generatedSitemapSlice1 = '';
    let sitemapSlice = '';
    if (i + 1000 > siteMapData2.length) {
      console.log(siteMapData2.slice(i, siteMapData2.length).length)
      sitemapSlice = `${siteMapData2.slice(i, siteMapData2.length).join("")}`;
      generatedSitemapSlice1 = `<?xml version="1.0" encoding="UTF-8"?>
                                <urlset
                                xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
                                xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                                xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd"
                                >
                                ${sitemapSlice}
                                </urlset>`;
    } else {
      console.log(siteMapData2.slice(i, i + 1000).length)
      sitemapSlice = `${siteMapData2.slice(i, i+1000).join("")}`;
      generatedSitemapSlice1 = `<?xml version="1.0" encoding="UTF-8"?>
                                <urlset
                                xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
                                xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                                xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd"
                                >
                                ${sitemapSlice}
                                </urlset>`;
    }
    const formattedSitemap2 = formatted(generatedSitemapSlice1);
    fs.writeFileSync(`${dirname}/public/sitemap-project-${(i/1000)+1}.xml`, formattedSitemap2, "utf8");
    mainSitemap.push(`${APP_URL}/sitemap-project-${(i/1000)+1}.xml`);
  }

  console.log(siteMapData2.length);

  //passsing directoryPath and callback function
  const commonPages = fs.readdirSync(directoryPath);

  let pages = [];
  commonPages.forEach(page => {
    let pageTemp = page.replace(".tsx", "");
    if (!pageTemp.match("[^a-zA-Z]+")) {
      pages.push(page)
    }
  });
  pages.splice(pages.indexOf('api'), 1);
  pages = pages.map(item => {
    return item.replace(".tsx", '');
  });

  console.log(pages);

  const commonPageSitemap = `
  ${pages
      .map(path => {
        return `
    <url>
      <loc>${APP_URL}/${path}</loc>
      <lastmod>${getDate}</lastmod>
    </url>`;
      })
      .join("")}
  `;


  const generatedCommonPageSitemap = `
  <?xml version="1.0" encoding="UTF-8"?>
  <urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd"
  >
  ${commonPageSitemap}
  </urlset>
  `;

  const formattedCommonPageSitemap = formatted(generatedCommonPageSitemap);

  fs.writeFileSync(`${dirname}/public/sitemap-common.xml`, formattedCommonPageSitemap, "utf8");
  mainSitemap.push(`${APP_URL}/sitemap-common.xml`);

  const mainSitemapData = `
  ${mainSitemap
      .map(path => {
        return `
    <url>
      <loc>${path}</loc>
      <lastmod>${getDate}</lastmod>
    </url>`;
      })
      .join("")}
  `;


  const generatedMainSitemap = `
  <?xml version="1.0" encoding="UTF-8"?>
  <urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd"
  >
  ${mainSitemapData}
  </urlset>
  `;

  const formattedMainSitemap = formatted(generatedMainSitemap);
  fs.writeFileSync(`${dirname}/public/sitemap.xml`, formattedMainSitemap, "utf8");
};

main()
  .catch((e) => {
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect()
  })