import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  EmbedBuilder,
  Events
} from "discord.js";
import express from "express";

/* ================== ANTI CRASH ================== */
process.on("unhandledRejection", e => console.error(e));
process.on("uncaughtException", e => console.error(e));

/* ================== HTTP 24/7 ================== */
const app = express();

app.get("/", (req, res) => {
  res.send("Argentina RP Bot activo 24/7");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log("🌐 Web server activo en puerto", PORT)
);

/* ================== CLIENTE ================== */
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

/* ================== VARIABLES ================== */
const {
  TOKEN,
  CLIENT_ID,
  GUILD_ID,
  CANAL_SERVER_ACTIVO,
  CANAL_SERVER_CERRADO,
  CANAL_LOGS_SERVER,
  ROL_MOD_ID
} = process.env;

/* ================== COMANDOS ================== */
const commands = [
  new SlashCommandBuilder().setName("ayuda").setDescription("Comandos disponibles"),
  new SlashCommandBuilder().setName("info").setDescription("Información del servidor"),
  new SlashCommandBuilder().setName("roles").setDescription("Roles disponibles"),
  new SlashCommandBuilder().setName("ticket").setDescription("Sistema de tickets"),
  new SlashCommandBuilder().setName("policia").setDescription("Ingreso a Policía"),
  new SlashCommandBuilder()
    .setName("server")
    .setDescription("Abrir o cerrar servidor")
    .addStringOption(o =>
      o.setName("estado")
        .setDescription("Estado del servidor")
        .setRequired(true)
        .addChoices(
          { name: "activo", value: "activo" },
          { name: "cerrado", value: "cerrado" }
        )
    )
].map(c => c.toJSON());

/* ================== REGISTRAR COMANDOS ================== */
const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {
  await rest.put(
    Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
    { body: commands }
  );
  console.log("✅ Comandos registrados");
})();

/* ================== READY ================== */
client.once("ready", () => {
  console.log(`🤖 Conectado como ${client.user.tag}`);
});

/* ================== INTERACCIONES ================== */
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  /* ---- PERMISOS SERVER ---- */
  if (interaction.commandName === "server") {
    if (!interaction.member.roles.cache.has(ROL_MOD_ID)) {
      return interaction.reply({
        content: "❌ No tenés permisos para usar este comando.",
        ephemeral: true
      });
    }

    const estado = interaction.options.getString("estado");

    if (estado === "activo") {
      const canal = await client.channels.fetch(CANAL_SERVER_ACTIVO);

      await canal.send(
        `** ¡Atención, jugadores de Argentina! 🎄🎁 ¡Grandes noticias! La República Argentina va a abrir el servidor para que todos puedan unirse y disfrutar de la mejor experiencia de juego. ¡Prepárense para formar equipos, competir y vivir aventuras épicas juntos! No importa si eres un jugador novato o un experto, ¡todos son bienvenidos! Así que ajusta tus controles, invita a tus amigos y ¡vamos a jugar! 🎆🥂**\n\n||@everyone|| 🌟\n\n🔑 **Código:** \`zaza1ajv\`\n🔗 https://www.roblox.com/es/games/7711635737`
      );

      await client.channels.fetch(CANAL_LOGS_SERVER)
        .then(c => c.send(`🟢 ${interaction.user.tag} abrió el servidor`));

      return interaction.reply({ content: "✅ Servidor abierto", ephemeral: true });
    }

    if (estado === "cerrado") {
      const canal = await client.channels.fetch(CANAL_SERVER_CERRADO);

      await canal.send(
        "🌙✨ **MUY BUENAS NOCHES, ARGENTINA RP 🇦🇷🔥**\n\nGracias por rolear hoy ❤️\nMañana volvemos con todo 🚀"
      );

      await client.channels.fetch(CANAL_LOGS_SERVER)
        .then(c => c.send(`🔴 ${interaction.user.tag} cerró el servidor`));

      return interaction.reply({ content: "🔒 Servidor cerrado", ephemeral: true });
    }
  }

  /* ---- COMANDOS NORMALES ---- */
  const embed = new EmbedBuilder().setColor(0x2f80ed);

  if (interaction.commandName === "ayuda") {
    embed.setTitle("🧠 Ayuda")
      .setDescription("/info\n/roles\n/ticket\n/policia\n/server");
  }

  if (interaction.commandName === "info") {
    embed.setTitle("🇦🇷 Argentina RP")
      .setDescription("Servidor de roleplay serio y activo");
  }

  if (interaction.commandName === "roles") {
    embed.setTitle("🎭 Roles")
      .setDescription("Civil\nPolicía\nMédico\nADAC");
  }

  if (interaction.commandName === "ticket") {
    embed.setTitle("🎫 Tickets")
      .setDescription("Usá el canal de tickets");
  }

  if (interaction.commandName === "policia") {
    embed.setTitle("🚓 Policía")
      .setDescription("Buen rol, sin sanciones, ticket abierto");
  }

  return interaction.reply({ embeds: [embed], ephemeral: true });
});

/* ================== LOGIN ================== */
client.login(TOKEN);
