const {
  PrismaClient
} = require('@prisma/client');

const prisma = new PrismaClient();

async function updateSlug(propertySlug){
  console.log("Started");
  for(i=0; i<propertySlug.length; i++){
    const count = await prisma.propertys.update({
      where: {
        id: propertySlug[i].id,
      },
      data: {
        propertySlug: propertySlug[i].slug,
      },
    });
    process.stdout.write("\r"+i);
  }
  return "Completed";
}

async function getPropertyDetails(){
  const details = await prisma.propertys.findMany({
    select: {
      id: true,
      projectName: true,
      location: true,
      district: true,
    },
  });
  return details;
}

async function main(){
  const propertyDetails = await getPropertyDetails();
  const propertySlug = [];
  propertyDetails.forEach(item => {
    let cleanProjectName = item.projectName.replace(/[^a-zA-Z ]/g,"").replace(/ /g, "-").replace(/-+/g, "-").replace(/-$/g, "");
    let slug = `${cleanProjectName}-${item.location.replace(/ /g, "-").replace(/-+/g, "-").replace(/-$/g, "")}-${item.district.replace(/ /g, "-").replace(/-+/g, "-").replace(/-$/g, "")}`.toLowerCase();
    propertySlug.push({id: item.id, slug});
  });
  const updated = await updateSlug(propertySlug);
  console.log(updated);
}

main()
  .catch((e) => {
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect()
  })