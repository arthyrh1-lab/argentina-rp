import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
  Events
} from "discord.js";
import express from "express";

/* ================= HTTP 24/7 ================= */
const app = express();
app.get("/", (req, res) => {
  res.send("Argentina RP Bot activo 24/7");
});
app.listen(process.env.PORT || 3000);

/* ================= CLIENTE ================= */
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

/* ================= VARIABLES ================= */
const {
  TOKEN,
  CLIENT_ID,
  GUILD_ID,
  CANAL_AVISOS
} = process.env;

const SOPORTE_URL =
  "https://discord.com/channels/1338912774327238778/1338919287842410516";

/* ================= COMANDOS ================= */
const commands = [
  new SlashCommandBuilder()
    .setName("ayuda")
    .setDescription("Muestra los comandos disponibles"),

  new SlashCommandBuilder()
    .setName("info")
    .setDescription("Información del servidor Argentina RP"),

  new SlashCommandBuilder()
    .setName("roles")
    .setDescription("Lista los roles disponibles"),

  new SlashCommandBuilder()
    .setName("ticket")
    .setDescription("Cómo crear un ticket"),

  new SlashCommandBuilder()
    .setName("policia")
    .setDescription("Ingreso a la Policía de Argentina"),

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

/* ================= REGISTRAR / ================= */
const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {
  await rest.put(
    Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
    { body: commands }
  );
  console.log("✅ Comandos registrados");
})();

/* ================= READY ================= */
client.once("ready", () => {
  console.log(`🤖 Conectado como ${client.user.tag}`);
});

/* ================= INTERACCIONES ================= */
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  /* ---- AYUDA ---- */
  if (interaction.commandName === "ayuda") {
    return interaction.reply({
      content:
        "🧠 **Comandos disponibles**\n\n" +
        "• `/info`\n" +
        "• `/roles`\n" +
        "• `/ticket`\n" +
        "• `/policia`\n" +
        "• `/server activo`\n" +
        "• `/server cerrado`",
      ephemeral: true
    });
  }

  /* ---- INFO ---- */
  if (interaction.commandName === "info") {
    const embed = new EmbedBuilder()
      .setTitle("🇦🇷 Argentina RP")
      .setDescription("Servidor de roleplay serio y divertido")
      .addFields(
        {
          name: "🎭 Roles disponibles",
          value:
            "• Civil\n• Policía\n• Médico\n• ADAC\n• Abogado/Juez\n• Político"
        },
        {
          name: "💡 Código del servidor",
          value: "`zaza1ajv`"
        },
        {
          name: "✨ Extras",
          value:
            "• Staff activo\n• Eventos y bandas\n• Bienvenidos nuevos jugadores"
        }
      )
      .setColor(0x2f80ed);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Soporte General")
        .setStyle(ButtonStyle.Link)
        .setURL(SOPORTE_URL)
    );

    return interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
  }

  /* ---- ROLES ---- */
  if (interaction.commandName === "roles") {
    return interaction.reply({
      content:
        "🎭 **Roles disponibles**\n• Civil\n• Policía\n• Médico\n• ADAC\n• Abogado/Juez\n• Político",
      ephemeral: true
    });
  }

  /* ---- TICKET ---- */
  if (interaction.commandName === "ticket") {
    return interaction.reply({
      content:
        "🎫 Para soporte general ingresá acá:\n" + SOPORTE_URL,
      ephemeral: true
    });
  }

  /* ---- POLICIA ---- */
  if (interaction.commandName === "policia") {
    return interaction.reply({
      content:
        "🚓 **Ingreso a Policía**\n\n" +
        "• Buen rol civil\n" +
        "• Sin sanciones activas\n" +
        "• Crear ticket de **Ser Policía**\n" +
        SOPORTE_URL,
      ephemeral: true
    });
  }

  /* ---- SERVER ACTIVO / CERRADO ---- */
  if (interaction.commandName === "server") {
    const canal = await client.channels.fetch(CANAL_AVISOS);

    if (interaction.options.getSubcommand() === "activo") {
      await canal.send(`
https://www.gifsanimados.org/data/media/562/linea-imagen-animada-0015.gif

**¡Atención, jugadores de Argentina! 🎄🎁  
El servidor de Argentina RP está ACTIVO**

👉 Código: \`zaza1ajv\`  
*(vengan a la zona del evento así anotamos)*

||@everyone|| 🌟

https://www.gifsanimados.org/data/media/562/linea-imagen-animada-0015.gif
`);
      return interaction.reply({ content: "✅ Aviso de servidor activo enviado.", ephemeral: true });
    }

    if (interaction.options.getSubcommand() === "cerrado") {
      await canal.send(`
🔒 **Servidor cerrado por el momento**

Gracias por participar ❤️  
Pronto avisaremos cuando vuelva a abrir.
`);
      return interaction.reply({ content: "✅ Aviso de servidor cerrado enviado.", ephemeral: true });
    }
  }
});

/* ================= LOGIN ================= */
client.login(TOKEN);

