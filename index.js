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
  Events,
  PermissionFlagsBits
} from "discord.js";
import express from "express";

/* ================= HTTP 24/7 ================= */
const app = express();
app.get("/", (req, res) => {
  res.send("Argentina RP Bot activo 24/7");
});
app.listen(process.env.PORT || 3000);

/* ================= CLIENT ================= */
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

/* ================= ENV ================= */
const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

const CANAL_SERVER_ACTIVO = process.env.CANAL_SERVER_ACTIVO;
const CANAL_SERVER_CERRADO = process.env.CANAL_SERVER_CERRADO;

const SOPORTE_URL =
  "https://discord.com/channels/1338912774327238778/1338919287842410516";

const LINK_JUEGO =
  "https://www.roblox.com/es/games/7711635737/Emergency-Hamburg";

/* ================= SLASH COMMANDS ================= */
const commands = [
  new SlashCommandBuilder().setName("ayuda").setDescription("Ver comandos"),

  new SlashCommandBuilder().setName("info").setDescription("Info Argentina RP"),

  new SlashCommandBuilder().setName("roles").setDescription("Roles disponibles"),

  new SlashCommandBuilder().setName("ticket").setDescription("Sistema de tickets"),

  new SlashCommandBuilder()
    .setName("policia")
    .setDescription("Ingreso a Policía"),

  new SlashCommandBuilder()
    .setName("server")
    .setDescription("Estado del servidor")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(sub =>
      sub.setName("activo").setDescription("Servidor abierto")
    )
    .addSubcommand(sub =>
      sub.setName("cerrado").setDescription("Servidor cerrado")
    )
].map(cmd => cmd.toJSON());

/* ================= REGISTER ================= */
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

/* ================= INTERACTIONS ================= */
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  /* ---- AYUDA ---- */
  if (interaction.commandName === "ayuda") {
    return interaction.reply({
      content:
        "📌 **Comandos disponibles**\n\n" +
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
      .setDescription("Servidor de roleplay serio y organizado")
      .addFields(
        {
          name: "🎭 Roles disponibles",
          value:
            "• Civil\n• Policía\n• Médico\n• ADAC\n• Abogado/Juez\n• Político"
        },
        {
          name: "🎮 Código del servidor",
          value: "`zaza1ajv`"
        },
        {
          name: "✨ Extras",
          value: "• Staff activo\n• Eventos\n• Bandas\n• Nuevos jugadores"
        }
      )
      .setColor(0x2f80ed)
      .setFooter({ text: "Argentina RP" });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Soporte General")
        .setStyle(ButtonStyle.Link)
        .setURL(SOPORTE_URL)
    );

    return interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: true
    });
  }

  /* ---- ROLES ---- */
  if (interaction.commandName === "roles") {
    return interaction.reply({
      content:
        "🎭 **Roles disponibles**\n\n" +
        "• Civil\n• Policía\n• Médico\n• ADAC\n• Abogado/Juez\n• Político",
      ephemeral: true
    });
  }

  /* ---- TICKET ---- */
  if (interaction.commandName === "ticket") {
    return interaction.reply({
      content:
        "🎫 **Sistema de Tickets**\n\n" +
        "Abrí un ticket desde el canal correspondiente:\n" +
        SOPORTE_URL,
      ephemeral: true
    });
  }

  /* ---- POLICIA ---- */
  if (interaction.commandName === "policia") {
    const embed = new EmbedBuilder()
      .setTitle("🚓 Ingreso a Policía de Argentina")
      .setDescription(
        "• Buen rol civil\n" +
        "• Sin sanciones activas\n" +
        "• Crear ticket **Ser Policía**\n" +
        "• Completar formulario\n" +
        "• DNI y licencia activa"
      )
      .setColor(0xe74c3c);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Abrir Ticket Policía")
        .setStyle(ButtonStyle.Link)
        .setURL(SOPORTE_URL)
    );

    return interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: true
    });
  }

  /* ---- SERVER ---- */
  if (interaction.commandName === "server") {
    const sub = interaction.options.getSubcommand();

    if (sub === "activo") {
      const canal = await client.channels.fetch(CANAL_SERVER_ACTIVO);

      await canal.send(`
**¡Atención, jugadores de Argentina! 🎄🎁**

¡Grandes noticias! El servidor ya se encuentra **ABIERTO**  
Vengan a la zona del evento así los anotamos 🎉  

🎮 **Código:** \`zaza1ajv\`  
🔗 ${LINK_JUEGO}

||@everyone|| 🌟
      `);

      return interaction.reply({
        content: "✅ Aviso de servidor abierto enviado.",
        ephemeral: true
      });
    }

    if (sub === "cerrado") {
      const canal = await client.channels.fetch(CANAL_SERVER_CERRADO);

      await canal.send(`
🌙 **Buenas noches Argentina RP 🇦🇷**

El servidor ya se encuentra **cerrado por hoy**.  
Gracias a todos por participar ❤️  

Descansen y nos vemos **mañana** 🔥
      `);

      return interaction.reply({
        content: "✅ Aviso de servidor cerrado enviado.",
        ephemeral: true
      });
    }
  }
});

/* ================= LOGIN ================= */
client.login(TOKEN);
