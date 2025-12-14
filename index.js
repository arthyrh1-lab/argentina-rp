import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  PermissionFlagsBits,
  Events
} from "discord.js";
import express from "express";

/* ================= HTTP 24/7 ================= */
const app = express();
app.get("/", (req, res) => res.send("Argentina RP Bot activo 24/7"));
app.listen(process.env.PORT || 3000);

/* ================= CLIENTE ================= */
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

/* ================= VARIABLES ================= */
const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
const CANAL_AVISOS = process.env.CANAL_AVISOS;

/* ================= COMANDOS ================= */
const commands = [
  new SlashCommandBuilder()
    .setName("server")
    .setDescription("Estado del servidor RP")
    .addSubcommand(sub =>
      sub.setName("activo").setDescription("Anunciar servidor activo")
    )
    .addSubcommand(sub =>
      sub.setName("cerrado").setDescription("Anunciar servidor cerrado")
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
].map(c => c.toJSON());

/* ================= REGISTRAR ================= */
const rest = new REST({ version: "10" }).setToken(TOKEN);
(async () => {
  await rest.put(
    Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
    { body: commands }
  );
  console.log("✅ Comando /server registrado");
})();

/* ================= READY ================= */
client.once("ready", () => {
  console.log(`🤖 Conectado como ${client.user.tag}`);
});

/* ================= INTERACCIONES ================= */
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== "server") return;

  try {
    await interaction.deferReply({ ephemeral: true });

    if (!CANAL_AVISOS) {
      return interaction.editReply("❌ CANAL_AVISOS no está configurado.");
    }

    const canal = await client.channels.fetch(CANAL_AVISOS);
    if (!canal) {
      return interaction.editReply("❌ No se pudo encontrar el canal.");
    }

    const sub = interaction.options.getSubcommand();

    if (sub === "activo") {
      await canal.send(`
https://www.gifsanimados.org/data/media/562/linea-imagen-animada-0015.gif

**¡Atención, jugadores de Argentina! 🎄🎁  
El servidor de Argentina RP está ACTIVO**

👉 Código: \`zaza1ajv\`  
*(vengan a la zona del evento así anotamos)*

||@everyone|| 🌟

https://www.gifsanimados.org/data/media/562/linea-imagen-animada-0015.gif
`);
      return interaction.editReply("✅ Aviso de **servidor activo** enviado.");
    }

    if (sub === "cerrado") {
      await canal.send("🔒 **Servidor cerrado por el momento**");
      return interaction.editReply("✅ Aviso de **servidor cerrado** enviado.");
    }
  } catch (err) {
    console.error("❌ ERROR SERVER:", err);
    if (!interaction.replied) {
      await interaction.reply({
        content: "❌ Ocurrió un error al ejecutar el comando.",
        ephemeral: true
      });
    }
  }
});

/* ================= LOGIN ================= */
client.login(TOKEN);
