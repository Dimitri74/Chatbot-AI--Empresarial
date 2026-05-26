/**
 * Gerador de documentos PDF - TechFlow Solutions
 * Executa: node generate-docs.js
 */

const PDFDocument = require('pdfkit')
const fs = require('fs')
const path = require('path')

const OUT_DIR = path.join(__dirname, '..', 'documents')

// ── Paleta TechFlow Solutions ───────────────────────────────────────────────
const C = {
  primary:   '#0A2E5C',  // azul escuro
  accent:    '#1E88E5',  // azul vibrante
  green:     '#00897B',  // teal
  light:     '#E3F2FD',  // azul claro
  gray:      '#546E7A',
  darkGray:  '#263238',
  white:     '#FFFFFF',
  divider:   '#B0BEC5',
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function addLogo(doc, subtitle = '') {
  // Barra superior colorida
  doc.rect(0, 0, doc.page.width, 72).fill(C.primary)

  // Símbolo TF (ícone simples)
  doc.roundedRect(36, 14, 42, 42, 6).fill(C.accent)
  doc.fontSize(22).fillColor(C.white).font('Helvetica-Bold')
     .text('TF', 36, 22, { width: 42, align: 'center' })

  // Nome da empresa
  doc.fontSize(18).fillColor(C.white).font('Helvetica-Bold')
     .text('TechFlow Solutions', 90, 16, { lineBreak: false })
  doc.fontSize(9).fillColor('#90CAF9').font('Helvetica')
     .text('Tecnologia que impulsiona resultados', 90, 38)

  // Subtítulo do documento
  if (subtitle) {
    doc.fontSize(9).fillColor('#CFD8DC').font('Helvetica-Oblique')
       .text(subtitle, 90, 52)
  }

  // Linha decorativa abaixo do header
  doc.rect(0, 72, doc.page.width, 4).fill(C.accent)

  doc.fillColor(C.darkGray).font('Helvetica')
  doc.y = 96
}

function addFooter(doc, pageNum, total, docTitle) {
  const y = doc.page.height - 36
  doc.rect(0, y - 8, doc.page.width, 1).fill(C.divider)
  doc.fontSize(8).fillColor(C.gray).font('Helvetica')
     .text(`TechFlow Solutions — ${docTitle}`, 36, y, { lineBreak: false })
  doc.text(`Página ${pageNum} de ${total}`, 0, y, { align: 'right', width: doc.page.width - 36 })
}

function heading1(doc, text) {
  doc.moveDown(0.4)
  doc.rect(36, doc.y, doc.page.width - 72, 26).fill(C.primary)
  doc.fontSize(12).fillColor(C.white).font('Helvetica-Bold')
     .text(text, 44, doc.y - 20, { lineBreak: false })
  doc.fillColor(C.darkGray).font('Helvetica')
  doc.moveDown(1.0)
}

function heading2(doc, text) {
  doc.moveDown(0.5)
  doc.fontSize(11).fillColor(C.accent).font('Helvetica-Bold').text(text)
  doc.rect(36, doc.y, 60, 2).fill(C.accent)
  doc.fillColor(C.darkGray).font('Helvetica').fontSize(10)
  doc.moveDown(0.4)
}

function body(doc, text) {
  doc.fontSize(10).fillColor(C.darkGray).font('Helvetica').text(text, { align: 'justify', lineGap: 2 })
  doc.moveDown(0.3)
}

function bullet(doc, items) {
  items.forEach(item => {
    doc.fontSize(10).fillColor(C.darkGray).font('Helvetica')
       .text(`• ${item}`, { indent: 16, lineGap: 2 })
  })
  doc.moveDown(0.3)
}

function infoBox(doc, label, value) {
  doc.moveDown(0.2)
  doc.rect(36, doc.y, doc.page.width - 72, 22).fill(C.light)
  doc.fontSize(9).fillColor(C.gray).font('Helvetica-Bold')
     .text(label.toUpperCase(), 44, doc.y - 16, { lineBreak: false })
  doc.fontSize(10).fillColor(C.primary).font('Helvetica-Bold')
     .text(value, 160, doc.y - 16, { lineBreak: false })
  doc.fillColor(C.darkGray).font('Helvetica')
  doc.moveDown(0.6)
}

function newPage(doc, subtitle, title) {
  doc.addPage()
  addLogo(doc, subtitle)
}

// ════════════════════════════════════════════════════════════════════════════
// DOC 1 — Manual do Funcionário
// ════════════════════════════════════════════════════════════════════════════
function gerarManualFuncionario() {
  const doc = new PDFDocument({ size: 'A4', margins: { top: 36, bottom: 50, left: 36, right: 36 } })
  const out = path.join(OUT_DIR, 'manual-funcionario.pdf')
  doc.pipe(fs.createWriteStream(out))

  const SUBTITLE = 'Manual do Funcionário — Versão 2026.1 | Vigência: Maio/2026'
  const TITLE    = 'Manual do Funcionário'

  // ── Página 1 ──────────────────────────────────────────────────────────────
  addLogo(doc, SUBTITLE)

  doc.moveDown(0.5)
  doc.fontSize(9).fillColor(C.gray).font('Helvetica-Oblique')
     .text('Documento Interno — Classificação: Interno', { align: 'center' })
  doc.moveDown(0.5)

  heading1(doc, '1. APRESENTAÇÃO')
  body(doc, 'Bem-vindo à TechFlow Solutions! Ficamos muito felizes em tê-lo como parte do nosso time. Somos uma empresa especializada em desenvolvimento de software personalizado, soluções de Inteligência Artificial e modernização de sistemas legados.')
  body(doc, 'Fundada em 2018, a TechFlow atende clientes nos segmentos financeiro, saúde, varejo e indústria, entregando soluções robustas com tecnologias modernas como Quarkus, Flutter, React e arquiteturas cloud-native.')
  body(doc, 'Este manual tem como objetivo apresentar as principais políticas, benefícios, regras e a cultura da empresa. Leia com atenção e guarde-o como referência.')

  heading1(doc, '2. NOSSA CULTURA E VALORES')
  bullet(doc, [
    'Inovação contínua — Buscamos sempre as melhores soluções tecnológicas.',
    'Colaboração e transparência — Acreditamos que os melhores resultados vêm do trabalho em equipe.',
    'Resultados com qualidade — Entregamos com excelência técnica e compromisso com o cliente.',
    'Desenvolvimento profissional constante — Investimos no crescimento de cada profissional.',
    'Diversidade e inclusão — Valorizamos perspectivas diferentes e um ambiente respeitoso.',
  ])

  heading1(doc, '3. BENEFÍCIOS')
  infoBox(doc, 'Saúde', 'Plano de saúde e odontológico premium — cobertura nacional (Bradesco Saúde)')
  infoBox(doc, 'Alimentação', 'Vale-refeição ou alimentação — R$ 1.200,00/mês (Cartão Flash)')
  infoBox(doc, 'Home Office', 'Modelo híbrido — 3 dias presenciais + 2 dias home office por semana')
  infoBox(doc, 'Educação', 'Auxílio educação e certificações — até R$ 800,00/mês com aprovação do gestor')
  infoBox(doc, 'PLR', 'Participação nos Lucros e Resultados — avaliação semestral por metas')
  infoBox(doc, 'Seguro de Vida', 'Cobertura de 36x o salário bruto (Porto Seguro)')
  infoBox(doc, 'Equipamento', 'Notebook corporativo + periféricos fornecidos pela empresa')

  addFooter(doc, 1, 3, TITLE)

  // ── Página 2 ──────────────────────────────────────────────────────────────
  newPage(doc, SUBTITLE, TITLE)

  heading1(doc, '4. JORNADA DE TRABALHO')
  body(doc, 'A TechFlow adota o modelo de jornada flexível, respeitando o total de 8 horas diárias e 40 horas semanais, conforme estabelecido em contrato.')
  bullet(doc, [
    'Horário de funcionamento do escritório: 08h às 20h.',
    'Jornada diária: 8 horas (com 1 hora de intervalo para almoço).',
    'Banco de horas: possibilidade de compensação mediante aprovação do gestor.',
    'Férias: 30 dias corridos após 12 meses de contrato (CLT).',
    'Ausências: devem ser comunicadas ao gestor com antecedência mínima de 2 horas.',
    'Horas extras eventuais serão compensadas ou remuneradas conforme legislação.',
  ])
  body(doc, 'Para solicitação de férias, o funcionário deve registrar a solicitação no sistema interno com pelo menos 30 dias de antecedência, sujeita à aprovação do gestor direto e disponibilidade da equipe.')

  heading1(doc, '5. DIAS PRESENCIAIS E HOME OFFICE')
  body(doc, 'O modelo híbrido da TechFlow foi desenhado para equilibrar colaboração presencial e flexibilidade. As regras são:')
  bullet(doc, [
    'Dias presenciais obrigatórios: terça-feira, quarta-feira e quinta-feira.',
    'Dias de home office: segunda-feira e sexta-feira.',
    'Reuniões de alinhamento de squads sempre às quartas-feiras (presencial).',
    'Em casos excepcionais, trocas de dias podem ser negociadas com o gestor.',
    'O funcionário em home office deve manter disponibilidade equivalente ao presencial.',
  ])

  heading1(doc, '6. REGRAS DE CONDUTA E ÉTICA')
  body(doc, 'Todos os funcionários da TechFlow devem aderir ao Código de Ética e Conduta, disponível no portal interno. Os principais pontos são:')
  bullet(doc, [
    'Confidencialidade absoluta das informações de clientes e projetos.',
    'Uso responsável de equipamentos, ferramentas e acessos corporativos.',
    'Respeito mútuo entre colegas, líderes e parceiros.',
    'Proibição de uso de propriedade intelectual da empresa para fins pessoais.',
    'Canal de Denúncias anônimo disponível 24h pelo portal interno.',
    'Violações ao código de ética serão apuradas pelo RH com possibilidade de desligamento.',
  ])

  addFooter(doc, 2, 3, TITLE)

  // ── Página 3 ──────────────────────────────────────────────────────────────
  newPage(doc, SUBTITLE, TITLE)

  heading1(doc, '7. DESENVOLVIMENTO PROFISSIONAL')
  body(doc, 'A TechFlow investe ativamente no crescimento de seus profissionais. Os programas disponíveis são:')
  bullet(doc, [
    'TechFlow Academy: plataforma interna de cursos e trilhas de aprendizagem.',
    'Auxílio para certificações técnicas (AWS, GCP, Oracle, etc.) — até R$ 800/mês.',
    'Mentoria individual com tech leads e gerentes.',
    'Participação em eventos técnicos (TDC, QCon, DevOpsDays, etc.).',
    'Apresentações internas de knowledge sharing — quinzenais às sextas.',
    'Plano de carreira revisado semestralmente com feedbacks estruturados.',
  ])

  heading1(doc, '8. FERRAMENTAS E ACESSOS')
  bullet(doc, [
    'Comunicação: Slack (canais por squad, projeto e área).',
    'Gerenciamento de projetos: Jira + Confluence.',
    'Repositório de código: GitHub (organização techflow-solutions).',
    'VPN corporativa obrigatória para acesso remoto.',
    'Gerenciamento de senhas: 1Password (licença corporativa).',
    'Cloud: AWS (acesso mediante solicitação ao time de DevOps).',
  ])

  heading1(doc, '9. CONTATOS IMPORTANTES')
  infoBox(doc, 'RH', 'rh@techflow.com.br | Ramal 101')
  infoBox(doc, 'TI / Suporte', 'ti@techflow.com.br | #suporte-tecnico (Slack)')
  infoBox(doc, 'Segurança', 'seguranca@techflow.com.br | Ramal 115')
  infoBox(doc, 'Canal Ético', 'canalético.techflow.com.br (anônimo, 24h)')
  infoBox(doc, 'Gestão', 'gestao@techflow.com.br | Ramal 200')

  doc.moveDown(0.5)
  doc.rect(36, doc.y, doc.page.width - 72, 40).fill(C.light)
  doc.fontSize(10).fillColor(C.primary).font('Helvetica-Bold')
     .text('Este manual é revisado anualmente. A versão vigente está sempre disponível no portal interno em docs.techflow.com.br/manual-funcionario', 44, doc.y - 32, { width: doc.page.width - 88, align: 'center' })

  addFooter(doc, 3, 3, TITLE)
  doc.end()
  console.log(`✓ ${out}`)
}

// ════════════════════════════════════════════════════════════════════════════
// DOC 2 — Política de Segurança da Informação
// ════════════════════════════════════════════════════════════════════════════
function gerarPoliticaSeguranca() {
  const doc = new PDFDocument({ size: 'A4', margins: { top: 36, bottom: 50, left: 36, right: 36 } })
  const out = path.join(OUT_DIR, 'politica-seguranca-informacao.pdf')
  doc.pipe(fs.createWriteStream(out))

  const SUBTITLE = 'Política de Segurança da Informação — Versão 1.0 | Maio/2026'
  const TITLE    = 'Política de Segurança da Informação'

  // ── Página 1 ──────────────────────────────────────────────────────────────
  addLogo(doc, SUBTITLE)

  doc.moveDown(0.3)
  doc.rect(36, doc.y, doc.page.width - 72, 24).fill('#FFF8E1')
  doc.fontSize(9).fillColor('#F57F17').font('Helvetica-Bold')
     .text('⚠  CLASSIFICAÇÃO: INTERNO — Distribuição restrita a colaboradores TechFlow', 44, doc.y - 17)
  doc.fillColor(C.darkGray).font('Helvetica')
  doc.moveDown(0.8)

  heading1(doc, '1. OBJETIVO E ESCOPO')
  body(doc, 'Esta política tem como objetivo proteger as informações, sistemas, infraestrutura e dados da TechFlow Solutions e de seus clientes, garantindo confidencialidade, integridade e disponibilidade.')
  body(doc, 'Aplica-se a todos os colaboradores, prestadores de serviço, estagiários e parceiros que tenham acesso, mesmo que eventual, aos sistemas e informações da empresa.')

  heading1(doc, '2. PRINCÍPIOS FUNDAMENTAIS')
  bullet(doc, [
    'Confidencialidade — Acesso às informações somente por pessoas autorizadas.',
    'Integridade — Informações precisas, completas e protegidas contra alterações indevidas.',
    'Disponibilidade — Sistemas e informações acessíveis quando necessário.',
    'Conformidade com a LGPD — Tratamento de dados pessoais conforme a Lei 13.709/2018.',
    'Responsabilização — Toda ação realizada nos sistemas é registrada e rastreável.',
  ])

  heading1(doc, '3. REGRAS OBRIGATÓRIAS — SENHAS E AUTENTICAÇÃO')
  bullet(doc, [
    'Senhas com mínimo de 12 caracteres (letras, números e símbolos).',
    'Autenticação de dois fatores (2FA) obrigatório para todos os acessos corporativos.',
    'Troca de senha obrigatória a cada 90 dias.',
    'Proibido compartilhar credenciais com qualquer pessoa, inclusive gestores.',
    'Uso de gerenciador de senhas corporativo (1Password) obrigatório.',
    'Tentativas de login suspeitas devem ser reportadas imediatamente ao time de TI.',
  ])

  heading1(doc, '4. REGRAS OBRIGATÓRIAS — EQUIPAMENTOS')
  bullet(doc, [
    'Bloqueio automático de tela após 5 minutos de inatividade.',
    'Proibido conectar dispositivos USB não autorizados (pen drives, HDs externos).',
    'Laptops corporativos não devem sair das instalações sem autorização formal.',
    'Criptografia de disco habilitada em todos os dispositivos (BitLocker/FileVault).',
    'Antivírus corporativo deve estar sempre ativo e atualizado.',
    'Atualizações de segurança do SO devem ser aplicadas em até 48h do lançamento.',
  ])

  addFooter(doc, 1, 3, TITLE)

  // ── Página 2 ──────────────────────────────────────────────────────────────
  newPage(doc, SUBTITLE, TITLE)

  heading1(doc, '5. CLASSIFICAÇÃO DAS INFORMAÇÕES')
  body(doc, 'Toda informação gerada ou tratada na TechFlow deve ser classificada em um dos seguintes níveis:')

  const classes = [
    ['PÚBLICO',       C.green,   'Informações divulgáveis externamente. Ex: site institucional, vagas abertas.'],
    ['INTERNO',       C.accent,  'Uso exclusivo de colaboradores. Ex: políticas, manuais, procedimentos.'],
    ['CONFIDENCIAL',  '#F57F17', 'Acesso restrito a times específicos. Ex: código-fonte de clientes, contratos.'],
    ['RESTRITO',      '#C62828', 'Acesso limitado a diretoria e gestores. Ex: dados financeiros, M&A.'],
  ]
  classes.forEach(([label, color, desc]) => {
    doc.moveDown(0.3)
    doc.rect(36, doc.y, 90, 20).fill(color)
    doc.fontSize(9).fillColor(C.white).font('Helvetica-Bold')
       .text(label, 36, doc.y - 14, { width: 90, align: 'center' })
    doc.fontSize(9).fillColor(C.darkGray).font('Helvetica')
       .text(desc, 136, doc.y - 14, { width: doc.page.width - 172 })
    doc.moveDown(0.3)
  })

  doc.moveDown(0.4)
  heading1(doc, '6. ACESSO REMOTO E VPN')
  bullet(doc, [
    'Uso de VPN corporativa obrigatório para qualquer acesso a sistemas internos fora do escritório.',
    'Proibido acessar sistemas da empresa por redes Wi-Fi públicas sem VPN ativa.',
    'Split tunneling desabilitado — todo tráfego deve passar pela VPN corporativa.',
    'Sessões VPN inativas por mais de 30 minutos são encerradas automaticamente.',
    'Credenciais VPN são pessoais e intransferíveis.',
  ])

  heading1(doc, '7. USO ACEITÁVEL DE RECURSOS')
  bullet(doc, [
    'Equipamentos e conexão corporativa são para uso profissional.',
    'Uso pessoal moderado é tolerado, desde que não comprometa a segurança.',
    'Proibido instalar software não homologado pelo time de TI.',
    'Acesso a sites inadequados (jogos, streaming ilegal, etc.) é bloqueado e registrado.',
    'E-mails corporativos não devem ser usados para cadastro em serviços pessoais.',
    'Proibido armazenar dados de clientes em serviços pessoais (Google Drive pessoal, Dropbox, etc.).',
  ])

  addFooter(doc, 2, 3, TITLE)

  // ── Página 3 ──────────────────────────────────────────────────────────────
  newPage(doc, SUBTITLE, TITLE)

  heading1(doc, '8. TRATAMENTO DE INCIDENTES DE SEGURANÇA')
  body(doc, 'Um incidente de segurança é qualquer evento que comprometa ou possa comprometer a confidencialidade, integridade ou disponibilidade de informações ou sistemas.')
  body(doc, 'Exemplos de incidentes: vazamento de dados, acesso não autorizado, malware, perda de dispositivo, phishing.')

  heading2(doc, 'Procedimento de Reporte')
  bullet(doc, [
    'Identificou algo suspeito? Não tente resolver sozinho.',
    'Contate imediatamente: seguranca@techflow.com.br ou Ramal 115.',
    'Preserve evidências (prints, logs, e-mails suspeitos).',
    'Não apague arquivos ou dados relacionados ao incidente.',
    'O time de segurança responderá em até 30 minutos em horário comercial.',
  ])

  heading1(doc, '9. LGPD E DADOS PESSOAIS')
  body(doc, 'A TechFlow é operadora e controladora de dados pessoais conforme a LGPD (Lei 13.709/2018). Todos os colaboradores devem:')
  bullet(doc, [
    'Tratar dados pessoais somente para as finalidades autorizadas.',
    'Não compartilhar dados de clientes e colaboradores sem necessidade comprovada.',
    'Reportar ao DPO (dpo@techflow.com.br) qualquer dúvida sobre tratamento de dados.',
    'Excluir dados pessoais quando não houver mais necessidade de retenção.',
    'Concluir o treinamento obrigatório de LGPD disponível na TechFlow Academy.',
  ])

  heading1(doc, '10. PENALIDADES')
  body(doc, 'O descumprimento desta política está sujeito a medidas disciplinares que podem variar de advertência formal até rescisão por justa causa, conforme gravidade da violação e legislação vigente.')

  doc.moveDown(0.5)
  infoBox(doc, 'Aprovado por', 'Diretoria de Tecnologia e RH — TechFlow Solutions')
  infoBox(doc, 'Vigência',     'Maio/2026 — revisão prevista: Maio/2027')
  infoBox(doc, 'Responsável',  'Time de Segurança da Informação | seguranca@techflow.com.br')

  addFooter(doc, 3, 3, TITLE)
  doc.end()
  console.log(`✓ ${out}`)
}

// ════════════════════════════════════════════════════════════════════════════
// DOC 3 — Catálogo de Serviços 2026
// ════════════════════════════════════════════════════════════════════════════
function gerarCatalogoServicos() {
  const doc = new PDFDocument({ size: 'A4', margins: { top: 36, bottom: 50, left: 36, right: 36 } })
  const out = path.join(OUT_DIR, 'catalogo-servicos-2026.pdf')
  doc.pipe(fs.createWriteStream(out))

  const SUBTITLE = 'Catálogo de Serviços 2026 — Uso Interno'
  const TITLE    = 'Catálogo de Serviços 2026'

  // ── Página 1 ──────────────────────────────────────────────────────────────
  addLogo(doc, SUBTITLE)

  doc.moveDown(0.5)
  body(doc, 'Este catálogo apresenta o portfólio completo de serviços da TechFlow Solutions para o ano de 2026. É destinado ao uso interno de vendas, pré-vendas e times técnicos.')

  heading1(doc, '1. DESENVOLVIMENTO DE SOFTWARE SOB MEDIDA')
  heading2(doc, 'Sistemas Web e Mobile')
  bullet(doc, [
    'Backend: Java/Quarkus, Node.js, Python (FastAPI).',
    'Frontend: React, Next.js, Angular.',
    'Mobile: Flutter (iOS e Android) e React Native.',
    'Integrações via REST, GraphQL e gRPC.',
    'Entrega ágil com squads multidisciplinares (Scrum/Kanban).',
  ])
  heading2(doc, 'Plataformas SaaS')
  bullet(doc, [
    'Arquitetura multi-tenant com isolamento de dados por cliente.',
    'Módulos de billing, controle de planos e onboarding self-service.',
    'Dashboards analíticos em tempo real.',
    'Infraestrutura escalável na AWS ou GCP.',
  ])

  heading1(doc, '2. INTELIGÊNCIA ARTIFICIAL E AUTOMAÇÃO')
  heading2(doc, 'Chatbots Corporativos com RAG')
  bullet(doc, [
    'Assistentes treinados com documentos internos da empresa.',
    'Stack: LangChain4j + Ollama (LLM local) ou OpenAI/Groq.',
    'Vector store com PostgreSQL + pgvector.',
    'Interface responsiva Next.js com modo claro/escuro.',
    'Guardrails de segurança: anti-injection, rate limiting.',
  ])
  heading2(doc, 'Machine Learning e Análise Preditiva')
  bullet(doc, [
    'Modelos de previsão de demanda, churn e fraude.',
    'Pipelines de dados com Apache Kafka e Spark.',
    'MLOps com MLflow e integração CI/CD.',
    'Dashboards executivos integrados ao BI existente.',
  ])

  addFooter(doc, 1, 3, TITLE)

  // ── Página 2 ──────────────────────────────────────────────────────────────
  newPage(doc, SUBTITLE, TITLE)

  heading1(doc, '3. MODERNIZAÇÃO DE SISTEMAS LEGADOS')
  body(doc, 'A TechFlow possui ampla experiência na migração de sistemas legados para arquiteturas modernas, minimizando riscos e garantindo continuidade operacional.')
  bullet(doc, [
    'Análise e mapeamento completo do sistema legado.',
    'Estratégias: strangler fig, lift-and-shift, rewrite gradual.',
    'Migração para microsserviços com Quarkus e Kubernetes.',
    'Adoção de padrões Cloud Native (12-Factor App).',
    'Refatoração com cobertura de testes automatizados (JUnit, Cypress).',
    'Monitoramento com OpenTelemetry, Prometheus e Grafana.',
  ])

  heading1(doc, '4. CONSULTORIA TÉCNICA')
  heading2(doc, 'Arquitetura de Software')
  bullet(doc, [
    'Design de microsserviços e event-driven architecture.',
    'Revisão e evolução de arquiteturas existentes.',
    'ADRs (Architecture Decision Records) documentados.',
  ])
  heading2(doc, 'DevOps e CI/CD')
  bullet(doc, [
    'Implementação de pipelines GitLab CI / GitHub Actions.',
    'Infraestrutura como código com Terraform e Pulumi.',
    'Kubernetes: deploy, autoscaling e observabilidade.',
    'Gestão de segredos com Vault e AWS Secrets Manager.',
  ])
  heading2(doc, 'Auditoria de Segurança')
  bullet(doc, [
    'Análise estática de código (SAST) e testes de penetração.',
    'Revisão de conformidade com OWASP Top 10.',
    'Avaliação de postura de segurança em cloud.',
    'Relatório executivo com plano de remediação priorizado.',
  ])

  heading1(doc, '5. SUPORTE E MANUTENÇÃO')
  body(doc, 'Os contratos de suporte TechFlow são estruturados nos seguintes níveis:')
  infoBox(doc, 'Plano Essencial', 'Horário comercial | SLA 8h | Correção de bugs críticos')
  infoBox(doc, 'Plano Business',  'Estendido (7h–22h) | SLA 4h | Correções + melhorias mensais')
  infoBox(doc, 'Plano Premium',   '24x7 | SLA 1h | Dedicação parcial de um engenheiro sênior')

  addFooter(doc, 2, 3, TITLE)

  // ── Página 3 ──────────────────────────────────────────────────────────────
  newPage(doc, SUBTITLE, TITLE)

  heading1(doc, '6. PROCESSO DE ENGAJAMENTO')
  body(doc, 'O processo padrão para início de um projeto na TechFlow segue as seguintes etapas:')
  const etapas = [
    ['01', 'Discovery',        'Workshop de levantamento de requisitos e definição de escopo (1–2 dias).'],
    ['02', 'Proposta Técnica', 'Documento com arquitetura proposta, stack tecnológica e estimativas.'],
    ['03', 'Kick-off',         'Onboarding do squad, setup de ambientes e ferramentas.'],
    ['04', 'Sprints',          'Ciclos de 2 semanas com demos ao cliente ao final de cada sprint.'],
    ['05', 'UAT',              'Fase de testes de aceitação com o cliente antes do go-live.'],
    ['06', 'Go-live',          'Deploy em produção com suporte dedicado nas primeiras 72h.'],
    ['07', 'Operação',         'Monitoramento contínuo e suporte pós-implantação.'],
  ]
  etapas.forEach(([num, name, desc]) => {
    doc.moveDown(0.2)
    doc.circle(48, doc.y + 8, 12).fill(C.accent)
    doc.fontSize(9).fillColor(C.white).font('Helvetica-Bold')
       .text(num, 36, doc.y - 4, { width: 24, align: 'center' })
    doc.fontSize(10).fillColor(C.primary).font('Helvetica-Bold')
       .text(name, 68, doc.y - 4, { lineBreak: false })
    doc.fontSize(9).fillColor(C.gray).font('Helvetica')
       .text(desc, 68, doc.y + 2, { width: doc.page.width - 104 })
    doc.moveDown(0.5)
  })

  heading1(doc, '7. CONTATO COMERCIAL')
  infoBox(doc, 'Vendas',       'vendas@techflow.com.br | +55 (11) 3456-7890')
  infoBox(doc, 'Pré-vendas',   'prevendas@techflow.com.br | #prevendas (Slack)')
  infoBox(doc, 'Parcerias',    'parcerias@techflow.com.br')
  infoBox(doc, 'Site',         'www.techflow.com.br')

  addFooter(doc, 3, 3, TITLE)
  doc.end()
  console.log(`✓ ${out}`)
}

// ════════════════════════════════════════════════════════════════════════════
// DOC 4 — Procedimentos de Onboarding
// ════════════════════════════════════════════════════════════════════════════
function gerarOnboarding() {
  const doc = new PDFDocument({ size: 'A4', margins: { top: 36, bottom: 50, left: 36, right: 36 } })
  const out = path.join(OUT_DIR, 'procedimentos-onboarding.pdf')
  doc.pipe(fs.createWriteStream(out))

  const SUBTITLE = 'Procedimentos de Onboarding — Novo Colaborador'
  const TITLE    = 'Onboarding TechFlow'

  // ── Página 1 ──────────────────────────────────────────────────────────────
  addLogo(doc, SUBTITLE)

  doc.moveDown(0.5)
  doc.rect(36, doc.y, doc.page.width - 72, 36).fill(C.primary)
  doc.fontSize(14).fillColor(C.white).font('Helvetica-Bold')
     .text('Bem-vindo ao time TechFlow! 🎉', 44, doc.y - 28, { width: doc.page.width - 88, align: 'center' })
  doc.fillColor(C.darkGray).font('Helvetica')
  doc.moveDown(1.0)

  body(doc, 'Este guia descreve o processo completo de integração para novos colaboradores. O programa de onboarding foi desenhado para que você se sinta bem-vindo, produtivo e alinhado com nossa cultura desde o primeiro dia.')

  heading1(doc, 'DIA 1 — BOAS-VINDAS E ESTRUTURA')
  bullet(doc, [
    'Recepção com o time de RH às 9h.',
    'Tour pelas instalações: escritório, salas de reunião, copa, áreas de descanso.',
    'Entrega de notebook corporativo, crachá e cartão de acesso.',
    'Configuração inicial: e-mail corporativo, Slack, GitHub e 1Password.',
    'Leitura e assinatura do Manual do Funcionário e Política de Segurança.',
    'Almoço de boas-vindas com o gestor direto e a equipe.',
  ])

  heading1(doc, 'DIA 2 — AMBIENTE E FERRAMENTAS')
  bullet(doc, [
    'Setup completo do ambiente de desenvolvimento (IDE, Docker, VPN, Git).',
    'Treinamento de ferramentas: Slack, Jira, Confluence, GitHub.',
    'Configuração e teste da VPN corporativa.',
    'Apresentação da arquitetura dos projetos do squad.',
    'Primeiro acesso ao Jira — criação do perfil e visão do backlog do time.',
    'Sessão de pair programming com um colega sênior do time.',
  ])

  heading1(doc, 'DIAS 3 A 5 — INTEGRAÇÃO TÉCNICA')
  bullet(doc, [
    'Reunião de alinhamento com o gestor: expectativas dos primeiros 30 dias.',
    'Definição das metas da primeira sprint do novo colaborador.',
    'Leitura da documentação de arquitetura dos projetos.',
    'Participação no daily standup do squad.',
    'Primeira tarefa técnica de baixa complexidade (warm-up task).',
    'Feedback formal ao final da primeira semana com o gestor.',
  ])

  addFooter(doc, 1, 2, TITLE)

  // ── Página 2 ──────────────────────────────────────────────────────────────
  newPage(doc, SUBTITLE, TITLE)

  heading1(doc, 'SEMANAS 2 A 4 — RAMPA DE PRODUTIVIDADE')
  bullet(doc, [
    'Participação completa em todas as cerimônias ágeis do squad.',
    'Contribuição crescente nas sprints com acompanhamento do tech lead.',
    'Revisão de PRs (code review) como observador e posteriormente como revisor.',
    'Conclusão do treinamento de LGPD na TechFlow Academy.',
    'Conclusão do treinamento de Segurança da Informação.',
    'Reunião de 30 dias com gestor e RH para avaliação do processo de onboarding.',
  ])

  heading1(doc, 'CHECKLIST DE ACESSOS — TI')
  const acessos = [
    'E-mail corporativo (@techflow.com.br)',
    'Slack — workspace techflow-solutions',
    'GitHub — organização techflow-solutions (permissão por repositório)',
    'Jira e Confluence',
    'VPN corporativa (credenciais enviadas por e-mail seguro)',
    '1Password — conta corporativa',
    'AWS Console (se aplicável ao papel — solicitação ao DevOps)',
    'TechFlow Academy (plataforma de treinamentos)',
  ]
  acessos.forEach((a, i) => {
    doc.moveDown(0.15)
    doc.rect(36, doc.y, 14, 14).stroke(C.accent)
    doc.fontSize(10).fillColor(C.darkGray).font('Helvetica')
       .text(`${a}`, 58, doc.y - 12)
    doc.moveDown(0.1)
  })

  doc.moveDown(0.5)
  heading1(doc, 'BUDDIES E MENTORIA')
  body(doc, 'Cada novo colaborador recebe um buddy — um colega experiente que acompanha a integração nas primeiras 4 semanas. O buddy não é o gestor direto, mas uma referência técnica e cultural.')
  bullet(doc, [
    'Reuniões diárias de 15 minutos na primeira semana.',
    'Reuniões semanais de 30 minutos nas semanas 2 a 4.',
    'Canal direto via Slack para dúvidas do dia a dia.',
    'Avaliação mútua ao final do período de onboarding.',
  ])

  infoBox(doc, 'RH — Onboarding', 'onboarding@techflow.com.br | Ramal 102')
  infoBox(doc, 'TI — Acessos',    'ti@techflow.com.br | #suporte-tecnico (Slack)')

  addFooter(doc, 2, 2, TITLE)
  doc.end()
  console.log(`✓ ${out}`)
}

// ════════════════════════════════════════════════════════════════════════════
// DOC 5 — Glossário Técnico e FAQ Interno
// ════════════════════════════════════════════════════════════════════════════
function gerarGlossarioFaq() {
  const doc = new PDFDocument({ size: 'A4', margins: { top: 36, bottom: 50, left: 36, right: 36 } })
  const out = path.join(OUT_DIR, 'glossario-tecnico-faq.pdf')
  doc.pipe(fs.createWriteStream(out))

  const SUBTITLE = 'Glossário Técnico e FAQ Interno — TechFlow Solutions 2026'
  const TITLE    = 'Glossário Técnico e FAQ'

  // ── Página 1 ──────────────────────────────────────────────────────────────
  addLogo(doc, SUBTITLE)

  heading1(doc, 'GLOSSÁRIO TÉCNICO')
  body(doc, 'Referência rápida dos principais termos técnicos utilizados nos projetos e documentos internos da TechFlow Solutions.')

  const termos = [
    ['Quarkus',          'Framework Java supersônico e subatômico, otimizado para Kubernetes e GraalVM native image. Stack principal do backend TechFlow.'],
    ['RAG',              'Retrieval-Augmented Generation — técnica que combina busca semântica em vetores com geração de texto por LLMs para respostas embasadas em documentos.'],
    ['LangChain4j',      'Biblioteca Java para construção de aplicações com LLMs, oferecendo abstrações para memory, tools, agents, RAG e AI services.'],
    ['pgvector',         'Extensão do PostgreSQL para armazenar e buscar vetores de alta dimensão (embeddings). Usada no vector store do Aether Chatbot.'],
    ['Embedding',        'Representação vetorial numérica de um texto, imagem ou dado, usada para busca semântica por similaridade.'],
    ['Ollama',           'Ferramenta para execução local de LLMs (llama3.2, mistral, etc.) sem dependência de APIs externas. Padrão para ambientes de desenvolvimento.'],
    ['Kafka',            'Plataforma de streaming distribuído para comunicação assíncrona entre microsserviços com alta disponibilidade.'],
    ['OpenTelemetry',    'Padrão open-source para observabilidade: traces distribuídos, métricas e logs estruturados. Integrado ao Prometheus e Grafana.'],
    ['2FA',              'Autenticação de dois fatores — camada extra de segurança além da senha, usando app autenticador (ex: Google Authenticator).'],
    ['VPN',              'Rede privada virtual — túnel criptografado para acesso seguro aos sistemas internos TechFlow de qualquer localização.'],
    ['ADR',              'Architecture Decision Record — documento que registra uma decisão arquitetural importante, seu contexto e consequências.'],
    ['LGPD',             'Lei Geral de Proteção de Dados (Lei 13.709/2018) — regulamenta o tratamento de dados pessoais no Brasil.'],
    ['DPO',              'Data Protection Officer — responsável pela conformidade com a LGPD na TechFlow. Contato: dpo@techflow.com.br'],
    ['SLA',              'Service Level Agreement — acordo formal de nível de serviço com tempo de resposta e resolução garantidos.'],
    ['Squad',            'Time multidisciplinar e autônomo (dev, QA, design, PO) responsável por um produto ou domínio de negócio.'],
  ]

  termos.forEach(([termo, def]) => {
    doc.moveDown(0.25)
    doc.fontSize(10).fillColor(C.primary).font('Helvetica-Bold').text(termo, { continued: true })
    doc.fontSize(10).fillColor(C.gray).font('Helvetica').text(' — ', { continued: true })
    doc.fontSize(10).fillColor(C.darkGray).font('Helvetica').text(def, { lineGap: 1 })
  })

  addFooter(doc, 1, 2, TITLE)

  // ── Página 2 ──────────────────────────────────────────────────────────────
  newPage(doc, SUBTITLE, TITLE)

  heading1(doc, 'FAQ INTERNO — PERGUNTAS FREQUENTES')

  const faqs = [
    ['Como funciona o modelo híbrido de trabalho?',
     'Os dias presenciais obrigatórios são terça-feira, quarta-feira e quinta-feira. Segunda e sexta são dias de home office. Trocas pontuais devem ser acordadas com o gestor com antecedência.'],
    ['Qual é o processo para solicitar férias?',
     'Faça a solicitação no sistema interno (portal.techflow.com.br) com pelo menos 30 dias de antecedência. O gestor tem até 5 dias úteis para aprovar ou propor alternativa. Férias são de 30 dias corridos após 12 meses de contrato.'],
    ['Como reportar um bug ou problema técnico?',
     'Abra um ticket no Jira (projeto SUPORTE) com severidade, descrição e prints. Para problemas críticos em produção, avise também no canal #incidentes do Slack e acione o on-call via PagerDuty.'],
    ['A empresa cobre certificações técnicas?',
     'Sim. O benefício é de até R$ 800,00/mês para certificações aprovadas pelo gestor. Submeta a solicitação via portal.techflow.com.br/certificacoes com o link do curso/exame e justificativa.'],
    ['Como funciona o PLR (Participação nos Lucros)?',
     'O PLR é avaliado semestralmente com base em metas individuais e da empresa. O valor médio histórico é de 1 a 2 salários por ciclo. Os critérios são divulgados no início de cada semestre pelo RH.'],
    ['Posso usar equipamento próprio para trabalhar?',
     'Não é recomendado. A política de segurança exige uso de equipamento corporativo homologado. Em casos excepcionais, contate o time de TI para avaliação de BYOD com as devidas configurações de segurança.'],
    ['Onde encontro a documentação dos projetos?',
     'No Confluence (confluence.techflow.com.br), organizado por squad e produto. Arquitetura e ADRs ficam no espaço "Arquitetura TechFlow". Para acesso, solicite ao gestor ou abra ticket no #suporte-tecnico.'],
    ['Como solicitar acesso a um novo sistema ou repositório?',
     'Abra um ticket no Jira (projeto TI-ACESSOS) com a justificativa e o gestor aprovador. O time de TI/DevOps processa em até 1 dia útil. Acessos em cloud (AWS) requerem aprovação adicional da gestão.'],
    ['Qual o canal para dúvidas sobre RH e benefícios?',
     'Canal #rh-beneficios no Slack ou e-mail rh@techflow.com.br. Para questões urgentes: Ramal 101. O RH atende de segunda a sexta das 9h às 18h.'],
    ['Como funciona o feedback e avaliação de desempenho?',
     'A TechFlow realiza ciclos de feedback formal a cada 6 meses (maio e novembro), usando o modelo 360°. Além disso, gestores e tech leads realizam 1:1s quinzenais com cada membro do time.'],
  ]

  faqs.forEach(([pergunta, resposta]) => {
    doc.moveDown(0.3)
    doc.rect(36, doc.y, 4, 999).fill(C.accent) // marcador lateral
    doc.fontSize(10).fillColor(C.primary).font('Helvetica-Bold')
       .text(`P: ${pergunta}`, 48, doc.y)
    doc.fontSize(10).fillColor(C.darkGray).font('Helvetica')
       .text(`R: ${resposta}`, 48, doc.y + 2, { lineGap: 1 })
    doc.moveDown(0.2)
  })

  addFooter(doc, 2, 2, TITLE)
  doc.end()
  console.log(`✓ ${out}`)
}

// ── Main ─────────────────────────────────────────────────────────────────────
console.log('\nGerando documentos TechFlow Solutions...\n')
gerarManualFuncionario()
gerarPoliticaSeguranca()
gerarCatalogoServicos()
gerarOnboarding()
gerarGlossarioFaq()
console.log('\nTodos os documentos gerados em: ../documents/\n')