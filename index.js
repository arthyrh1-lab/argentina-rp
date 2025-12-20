import express from "express";
import fs from "fs";
import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  EmbedBuilder,
  Events,
  PermissionFlagsBits
} from "discord.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (_, res) => {
  res.send("🤖 Argentina RP Bot activo 24/7");
});

app.listen(PORT, () => {
  console.log("🌐 Web server activo en puerto", PORT);
});

/* ================= CLIENT ================= */
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const {
  TOKEN,
  CLIENT_ID,
  GUILD_ID,
  ROL_MOD,
  CANAL_SERVER_ABIERTO,
  CANAL_SERVER_CERRADO,
  CANAL_LOGS,
} = process.env;

if (!TOKEN || !CLIENT_ID || !GUILD_ID) {
  console.error("❌ Faltan variables obligatorias");
  process.exit(1);
}

const PLACAS_FILE = "./placas.json";

function leerPlacas() {
  return JSON.parse(fs.readFileSync(PLACAS_FILE, "utf8"));
}

function guardarPlacas(data) {
  fs.writeFileSync(PLACAS_FILE, JSON.stringify(data, null, 2));
}

const commands = [
  new SlashCommandBuilder().setName("ayuda").setDescription("Ver comandos"),
  new SlashCommandBuilder().setName("info").setDescription("Info del servidor"),
  new SlashCommandBuilder().setName("roles").setDescription("Roles disponibles"),
  new SlashCommandBuilder().setName("ticket").setDescription("Soporte"),
  new SlashCommandBuilder().setName("policia").setDescription("Postulación Policía"),

  new SlashCommandBuilder()
    .setName("server")
    .setDescription("Estado del servidor")
    .addSubcommand(s =>
      s.setName("activo").setDescription("Abrir servidor")
    )
    .addSubcommand(s =>
      s.setName("cerrado").setDescription("Cerrar servidor")
    ),

  new SlashCommandBuilder()
    .setName("placa")
    .setDescription("Registrar placa")
    .addStringOption(o =>
      o.setName("nombre").setDescription("Nombre").setRequired(true)
    )
    .addStringOption(o =>
      o.setName("rango").setDescription("Rango").setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("ver-placa")
    .setDescription("Ver placa")
    .addUserOption(o =>
      o.setName("usuario").setDescription("Usuario").setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("lista-placas")
    .setDescription("Lista de placas"),

  new SlashCommandBuilder()
    .setName("borrar-placa")
    .setDescription("Borrar placa")
    .addUserOption(o =>
      o.setName("usuario").setDescription("Usuario").setRequired(true)
    )
].map(c => c.toJSON());

/* ================= REGISTER ================= */
const rest = new REST({ version: "10" }).setToken(TOKEN);

await rest.put(
  Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
  { body: commands }
);

console.log("✅ Comandos registrados");

/* ================= READY ================= */
client.once(Events.ClientReady, () => {
  console.log(`🤖 Conectado como ${client.user.tag}`);
});

/* ================= INTERACTIONS ================= */
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const isMod = interaction.member.roles.cache.has(ROL_MOD);

  /* ===== AYUDA ===== */
  if (interaction.commandName === "ayuda") {
    const e = new EmbedBuilder()
      .setTitle("🧠 Comandos")
      .setDescription(
        "/info\n/roles\n/ticket\n/policia\n/server\n/placa"
      )
      .setColor(0x3498db);
    return interaction.reply({ embeds: [e], ephemeral: true });
  }

  /* ===== SERVER ===== */
  if (interaction.commandName === "server") {
    if (!isMod) {
      return interaction.reply({ content: "❌ Sin permisos", ephemeral: true });
    }

    const sub = interaction.options.getSubcommand();
    const canal =
      sub === "activo"
        ? CANAL_SERVER_ABIERTO
        : CANAL_SERVER_CERRADO;

    const mensaje =
      sub === "activo"
        ? `**¡Atención jugadores! 🎄🎁**\n\nServidor ABIERTO\n\n||@everyone||\n\nCódigo: **zaza1ajv**`
        : `🌙✨ **Buenas noches Argentina RP**\n\nServidor cerrado por hoy nos vemos mañana ❤️`;

    const channel = await client.channels.fetch(canal);
    await channel.send(mensaje);

    const logs = await client.channels.fetch(CANAL_LOGS);
    await logs.send(
      `📝 ${interaction.user.tag} usó /server ${sub}`
    );

    return interaction.reply({ content: "✅ Aviso enviado", ephemeral: true });
  }

  /* ===== PLACA ===== */
  if (interaction.commandName === "placa") {
    const data = leerPlacas();
    const placaNum = String(data.contador).padStart(3, "0");

    data.placas[interaction.user.id] = {
      nombre: interaction.options.getString("nombre"),
      rango: interaction.options.getString("rango"),
      placa: `P${placaNum}`
    };

    data.contador++;
    guardarPlacas(data);

    await interaction.member.setNickname(
      `${interaction.options.getString("rango")} || ${interaction.options.getString("nombre")} #P${placaNum}`
    );

    return interaction.reply({
      content: `✅ Placa asignada **P${placaNum}**`,
      ephemeral: true
    });
  }

  /* ===== VER PLACA ===== */
  if (interaction.commandName === "ver-placa") {
    if (!isMod) return interaction.reply({ content: "❌ Sin permisos", ephemeral: true });

    const user = interaction.options.getUser("usuario");
    const data = leerPlacas();
    const p = data.placas[user.id];

    if (!p) return interaction.reply({ content: "❌ Sin placa", ephemeral: true });

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("📋 Placa")
          .addFields(
            { name: "Usuario", value: `<@${user.id}>` },
            { name: "Nombre", value: p.nombre },
            { name: "Rango", value: p.rango },
            { name: "Placa", value: p.placa },
            { name: "Foto", value: p.foto },

          )
          .setColor(0x2ecc71)
      ]
    });
  }

  if (interaction.commandName === "lista-placas") {
    const data = leerPlacas();
    const lista = Object.values(data.placas)
      .map(p => `${p.placa} — ${p.nombre}`)
      .join("\n");

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("📄 Placas registradas")
          .setDescription(lista || "Sin placas")
          .setColor(0xf1c40f)
      ]
    });
  }

  if (interaction.commandName === "borrar-placa") {
    if (!isMod) return interaction.reply({ content: "❌ No tiene autorización", ephemeral: true });

    const user = interaction.options.getUser("usuario");
    const data = leerPlacas();
    delete data.placas[user.id];
    guardarPlacas(data);

    return interaction.reply({ content: "🗑️ Placa eliminada   ", ephemeral: true });
  }
});

client.login(TOKEN);
