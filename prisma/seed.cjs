require("dotenv/config");

const { randomBytes, scryptSync } = require("crypto");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");

const initialSetup = require("./initial-setup.json");

function gerarHashSenha(senha) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(senha, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function obterConfiguracaoSeed() {
  return {
    tenant: {
      name: process.env.SEED_NOME_SALAO || initialSetup.tenant.name,
      slug: process.env.SEED_SLUG_SALAO || initialSetup.tenant.slug,
    },
    owner: {
      fullName: process.env.SEED_NOME_PROPRIETARIO || initialSetup.owner.fullName,
      email: process.env.SEED_EMAIL_PROPRIETARIO || initialSetup.owner.email,
      password: process.env.SEED_SENHA_PROPRIETARIO || initialSetup.owner.password,
    },
  };
}

async function main() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL nao esta definida.");
  }

  const { tenant, owner } = obterConfiguracaoSeed();

  if (owner.password.length < 8) {
    throw new Error("SEED_SENHA_PROPRIETARIO deve ter no minimo 8 caracteres.");
  }

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  try {
    await prisma.$transaction(async (trx) => {
      const tenantRecord = await trx.tenant.upsert({
        where: { slug: tenant.slug },
        update: { name: tenant.name },
        create: {
          name: tenant.name,
          slug: tenant.slug,
        },
      });

      for (const role of initialSetup.roles) {
        await trx.role.upsert({
          where: { key: role.key },
          update: { description: role.description },
          create: role,
        });
      }

      for (const permission of initialSetup.permissions) {
        await trx.permission.upsert({
          where: { key: permission.key },
          update: { description: permission.description },
          create: permission,
        });
      }

      for (const [roleKey, permissionKeys] of Object.entries(initialSetup.rolePermissions)) {
        const role = await trx.role.findUniqueOrThrow({
          where: { key: roleKey },
        });

        for (const permissionKey of permissionKeys) {
          const permission = await trx.permission.findUniqueOrThrow({
            where: { key: permissionKey },
          });

          await trx.rolePermission.upsert({
            where: {
              roleId_permissionId: {
                roleId: role.id,
                permissionId: permission.id,
              },
            },
            update: {},
            create: {
              roleId: role.id,
              permissionId: permission.id,
            },
          });
        }
      }

      const passwordHash = gerarHashSenha(owner.password);

      const ownerRecord = await trx.user.upsert({
        where: {
          tenantId_email: {
            tenantId: tenantRecord.id,
            email: owner.email,
          },
        },
        update: {
          fullName: owner.fullName,
          passwordHash,
          status: "ACTIVE",
        },
        create: {
          tenantId: tenantRecord.id,
          fullName: owner.fullName,
          email: owner.email,
          passwordHash,
          status: "ACTIVE",
        },
      });

      const ownerRole = await trx.role.findUniqueOrThrow({
        where: { key: "PROPRIETARIO" },
      });

      await trx.userRole.upsert({
        where: {
          userId_roleId: {
            userId: ownerRecord.id,
            roleId: ownerRole.id,
          },
        },
        update: {},
        create: {
          userId: ownerRecord.id,
          roleId: ownerRole.id,
        },
      });

      for (const channel of initialSetup.socialChannels) {
        await trx.socialChannelConfig.upsert({
          where: {
            tenantId_channel: {
              tenantId: tenantRecord.id,
              channel: channel.channel,
            },
          },
          update: {
            webhookUrl: channel.webhookUrl,
            isActive: channel.isActive,
          },
          create: {
            tenantId: tenantRecord.id,
            channel: channel.channel,
            webhookUrl: channel.webhookUrl,
            isActive: channel.isActive,
          },
        });
      }
    });
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => {
    console.log("Seed inicial aplicada com sucesso.");
  })
  .catch((error) => {
    console.error("Falha ao aplicar seed inicial.");
    console.error(error);
    process.exit(1);
  });
