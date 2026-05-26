/**
 * TechFlow Solutions — Gerador de Documentos PDF v2
 * Motor de layout reescrito: todas as funções capturam `y` antes de desenhar,
 * eliminando o problema de cursor imprevisível do pdfkit após fill/stroke.
 */

const PDFDocument = require('pdfkit')
const fs          = require('fs')
const path        = require('path')

const OUT = path.join(__dirname, '..', 'documents')

// ── Paleta ───────────────────────────────────────────────────────────────────
const P = {
  navy:    '#0D2B4E',
  blue:    '#1565C0',
  teal:    '#00796B',
  amber:   '#F57F17',
  red:     '#C62828',
  ice:     '#E8F1FB',
  mint:    '#E0F2F1',
  yellow:  '#FFFDE7',
  white:   '#FFFFFF',
  ink:     '#1A1A2E',
  slate:   '#4A5568',
  mist:    '#B0BEC5',
  line:    '#CFD8DC',
}

const W = 595.28   // A4 width  (pt)
const ML = 40      // margin left
const MR = 40      // margin right
const CW = W - ML - MR  // content width

// ════════════════════════════════════════════════════════════════════════════
// MOTOR DE LAYOUT
// ════════════════════════════════════════════════════════════════════════════

function doc_new() {
  return new PDFDocument({ size: 'A4', margins: { top: 40, bottom: 55, left: ML, right: MR }, autoFirstPage: true })
}

/** Cabeçalho TechFlow — retorna y depois do header */
function header(doc, docTitle, version = '') {
  // fundo navy
  doc.rect(0, 0, W, 68).fill(P.navy)
  // barra accent
  doc.rect(0, 68, W, 5).fill(P.blue)

  // badge TF
  const bx = 18, by = 12
  doc.roundedRect(bx, by, 44, 44, 8).fill(P.blue)
  doc.fontSize(20).fillColor(P.white).font('Helvetica-Bold')
     .text('TF', bx, by + 10, { width: 44, align: 'center' })

  // nome + slogan
  doc.fontSize(17).fillColor(P.white).font('Helvetica-Bold')
     .text('TechFlow Solutions', 72, 16)
  doc.fontSize(8.5).fillColor('#90CAF9').font('Helvetica')
     .text('Tecnologia que impulsiona resultados', 73, 36)

  // título do documento (direita)
  const titleX = W - MR - 200
  doc.fontSize(9).fillColor('#CFD8DC').font('Helvetica-Bold')
     .text(docTitle.toUpperCase(), titleX, 18, { width: 200, align: 'right' })
  if (version) {
    doc.fontSize(8).fillColor('#90CAF9').font('Helvetica')
       .text(version, titleX, 32, { width: 200, align: 'right' })
  }

  doc.y = 85
  return 85
}

/** Rodapé com paginação */
function footer(doc, page, total, label) {
  const fy = doc.page.height - 42
  doc.rect(ML, fy - 6, CW, 0.5).fill(P.line)
  doc.fontSize(7.5).fillColor(P.slate).font('Helvetica')
     .text(`TechFlow Solutions  •  ${label}  •  Documento Interno`, ML, fy, { width: CW * 0.7 })
  doc.fontSize(7.5).fillColor(P.slate)
     .text(`Página ${page} de ${total}`, ML, fy, { width: CW, align: 'right' })
}

/** Seção H1 — fundo navy, texto branco */
function h1(doc, text) {
  doc.moveDown(0.5)
  const y = doc.y
  doc.rect(ML, y, CW, 24).fill(P.navy)
  doc.fontSize(10.5).fillColor(P.white).font('Helvetica-Bold')
     .text(text, ML + 8, y + 7, { width: CW - 16, lineBreak: false })
  doc.y = y + 30
  doc.fillColor(P.ink).font('Helvetica').fontSize(10)
}

/** Seção H2 — linha azul lateral */
function h2(doc, text) {
  doc.moveDown(0.4)
  const y = doc.y
  doc.rect(ML, y, 3, 16).fill(P.blue)
  doc.fontSize(10.5).fillColor(P.blue).font('Helvetica-Bold')
     .text(text, ML + 10, y + 2)
  doc.y = y + 22
  doc.fillColor(P.ink).font('Helvetica').fontSize(10)
}

/** Parágrafo justificado */
function p(doc, text) {
  doc.fontSize(10).fillColor(P.ink).font('Helvetica')
     .text(text, ML, doc.y, { width: CW, align: 'justify', lineGap: 1.5 })
  doc.moveDown(0.4)
}

/** Lista de bullets */
function ul(doc, items) {
  items.forEach(item => {
    const y = doc.y
    doc.circle(ML + 6, y + 5, 2.5).fill(P.blue)
    doc.fontSize(10).fillColor(P.ink).font('Helvetica')
       .text(item, ML + 16, y, { width: CW - 16, lineGap: 1.5 })
    doc.moveDown(0.25)
  })
  doc.moveDown(0.1)
}

/** Lista numerada */
function ol(doc, items) {
  items.forEach((item, i) => {
    const y = doc.y
    doc.fontSize(10).fillColor(P.blue).font('Helvetica-Bold')
       .text(`${i + 1}.`, ML, y, { width: 18, lineBreak: false })
    doc.fontSize(10).fillColor(P.ink).font('Helvetica')
       .text(item, ML + 20, y, { width: CW - 20, lineGap: 1.5 })
    doc.moveDown(0.25)
  })
  doc.moveDown(0.1)
}

/** Caixa de destaque (info box) */
function infoBox(doc, label, value, color = P.ice) {
  const y = doc.y
  const h = 26
  doc.rect(ML, y, CW, h).fill(color)
  doc.rect(ML, y, 4, h).fill(P.blue)
  doc.fontSize(8).fillColor(P.slate).font('Helvetica-Bold')
     .text(label.toUpperCase(), ML + 12, y + 5, { width: 100, lineBreak: false })
  doc.fontSize(10).fillColor(P.navy).font('Helvetica-Bold')
     .text(value, ML + 120, y + 5, { width: CW - 130, lineBreak: false })
  doc.y = y + h + 4
  doc.fillColor(P.ink).font('Helvetica').fontSize(10)
}

/** Caixa de alerta/aviso */
function alertBox(doc, text, color = P.yellow, borderColor = P.amber) {
  const y = doc.y
  // medir altura do texto antes
  const textHeight = doc.heightOfString(text, { width: CW - 32 })
  const h = textHeight + 18
  doc.rect(ML, y, CW, h).fill(color)
  doc.rect(ML, y, 4, h).fill(borderColor)
  doc.fontSize(9.5).fillColor(P.ink).font('Helvetica')
     .text(text, ML + 14, y + 9, { width: CW - 22, lineGap: 1.5 })
  doc.y = y + h + 6
}

/** Tabela simples: headers[] + rows[][] */
function table(doc, headers, rows, colWidths) {
  const rowH    = 22
  const headH   = 26
  let y = doc.y

  // cabeçalho
  doc.rect(ML, y, CW, headH).fill(P.navy)
  let cx = ML
  headers.forEach((h, i) => {
    doc.fontSize(9).fillColor(P.white).font('Helvetica-Bold')
       .text(h, cx + 6, y + 8, { width: colWidths[i] - 8, lineBreak: false })
    cx += colWidths[i]
  })
  y += headH

  // linhas
  rows.forEach((row, ri) => {
    const bg = ri % 2 === 0 ? P.white : P.ice
    doc.rect(ML, y, CW, rowH).fill(bg)
    // borda inferior
    doc.rect(ML, y + rowH - 0.5, CW, 0.5).fill(P.line)
    let cx2 = ML
    row.forEach((cell, ci) => {
      doc.fontSize(9).fillColor(P.ink).font('Helvetica')
         .text(String(cell), cx2 + 6, y + 7, { width: colWidths[ci] - 8, lineBreak: false })
      cx2 += colWidths[ci]
    })
    y += rowH
  })

  // borda externa
  doc.rect(ML, doc.y, CW, y - doc.y).stroke(P.line)
  doc.y = y + 8
}

/** Divisor horizontal */
function divider(doc) {
  doc.moveDown(0.3)
  doc.rect(ML, doc.y, CW, 0.5).fill(P.line)
  doc.moveDown(0.5)
}

/** Nova página com header já desenhado */
function newPage(doc, docTitle, version = '') {
  doc.addPage()
  header(doc, docTitle, version)
}

/** Caixa de etapa de processo (step box) */
function stepBox(doc, num, title, desc) {
  const y = doc.y
  const h = 44
  doc.rect(ML, y, CW, h).fill(P.ice)
  doc.rect(ML, y, 44, h).fill(P.blue)
  // número
  doc.fontSize(18).fillColor(P.white).font('Helvetica-Bold')
     .text(String(num).padStart(2, '0'), ML, y + 10, { width: 44, align: 'center', lineBreak: false })
  // título
  doc.fontSize(11).fillColor(P.navy).font('Helvetica-Bold')
     .text(title, ML + 52, y + 6, { width: CW - 56, lineBreak: false })
  // descrição
  doc.fontSize(9).fillColor(P.slate).font('Helvetica')
     .text(desc, ML + 52, y + 22, { width: CW - 56, lineBreak: false })
  doc.y = y + h + 5
}

/** Bloco de pergunta/resposta FAQ */
function faqItem(doc, q, a) {
  const y = doc.y
  const qH = doc.heightOfString(`P: ${q}`, { width: CW - 20 }) + 4
  const aH = doc.heightOfString(`R: ${a}`, { width: CW - 20 }) + 4
  const total = qH + aH + 20

  doc.rect(ML, y, CW, total).fill(P.white)
  doc.rect(ML, y, 4, total).fill(P.teal)

  doc.fontSize(10).fillColor(P.navy).font('Helvetica-Bold')
     .text(`P: ${q}`, ML + 12, y + 8, { width: CW - 18 })
  const afterQ = doc.y + 2
  doc.fontSize(10).fillColor(P.ink).font('Helvetica')
     .text(`R: ${a}`, ML + 12, afterQ, { width: CW - 18, lineGap: 1.5 })

  doc.y = y + total + 6
  doc.rect(ML, y, CW, total).stroke(P.line)
}

/** Bloco de glossário */
function glossItem(doc, term, def) {
  const y = doc.y
  const defH = doc.heightOfString(def, { width: CW - 110 }) + 4
  const h = Math.max(defH, 20) + 10

  doc.rect(ML, y, 100, h).fill(P.navy)
  doc.rect(ML + 100, y, CW - 100, h).fill(ri => ri % 2 === 0 ? P.white : P.ice)
  doc.rect(ML + 100, y, CW - 100, h).fill(P.white)
  doc.rect(ML, y, CW, h).stroke(P.line)

  doc.fontSize(9.5).fillColor(P.white).font('Helvetica-Bold')
     .text(term, ML + 4, y + (h - 12) / 2, { width: 92, lineBreak: false })
  doc.fontSize(9.5).fillColor(P.ink).font('Helvetica')
     .text(def, ML + 108, y + 8, { width: CW - 116, lineGap: 1.5 })

  doc.y = y + h
}

// ════════════════════════════════════════════════════════════════════════════
// DOCUMENTO 1 — MANUAL DO FUNCIONÁRIO (4 páginas)
// ════════════════════════════════════════════════════════════════════════════
function gerarManual() {
  const TITLE   = 'Manual do Funcionário'
  const VERSION = 'Versão 2026.1  |  Vigência: Maio/2026'
  const doc     = doc_new()
  const out     = path.join(OUT, 'manual-funcionario.pdf')
  doc.pipe(fs.createWriteStream(out))

  // ── P1 ───────────────────────────────────────────────────────────────────
  header(doc, TITLE, VERSION)
  alertBox(doc, 'Documento Interno — Leitura obrigatória para todos os novos colaboradores. Versão vigente disponível em portal.techflow.com.br/manual')

  h1(doc, '1. APRESENTAÇÃO')
  p(doc, 'Bem-vindo à TechFlow Solutions! Fundada em 2018, somos uma empresa brasileira especializada em desenvolvimento de software sob medida, soluções de Inteligência Artificial e modernização de sistemas legados. Atendemos clientes nos segmentos financeiro, saúde, varejo, indústria e setor público, entregando soluções robustas com tecnologias modernas.')
  p(doc, 'Nosso time é composto por mais de 120 profissionais distribuídos em São Paulo (sede), Curitiba e em modelo remoto. Acreditamos que pessoas motivadas, ambientes saudáveis e tecnologia de ponta são a base para resultados extraordinários.')
  p(doc, 'Este Manual reúne as principais políticas, benefícios, direitos e responsabilidades que norteiam a relação entre a TechFlow e seus colaboradores. Leia com atenção, guarde-o como referência e consulte o RH sempre que tiver dúvidas.')

  h1(doc, '2. NOSSA CULTURA E VALORES')
  ul(doc, [
    'Inovação contínua — Buscamos sempre as melhores soluções. Aprendemos rápido, experimentamos e melhoramos.',
    'Colaboração e transparência — Os melhores resultados vêm de equipes alinhadas e comunicação aberta.',
    'Resultados com qualidade — Entregamos com excelência técnica e compromisso real com o cliente.',
    'Desenvolvimento profissional — Investimos no crescimento de cada pessoa do time.',
    'Diversidade e inclusão — Valorizamos diferentes perspectivas e mantemos um ambiente respeitoso e seguro.',
    'Responsabilidade social — Nos preocupamos com o impacto das nossas ações na sociedade e no meio ambiente.',
  ])

  h1(doc, '3. BENEFÍCIOS')
  table(doc,
    ['Benefício', 'Detalhes', 'Fornecedor'],
    [
      ['Plano de Saúde',        'Cobertura nacional, titulares e dependentes',     'Bradesco Saúde — Plano Especial'],
      ['Plano Odontológico',    'Incluído no plano de saúde, sem custo adicional',  'Bradesco Dental'],
      ['Vale-Refeição/Aliment.','R$ 1.200,00/mês — crédito mensal',                'Cartão Flash'],
      ['Home Office',           '3 dias presenciais + 2 dias remoto por semana',    'Política HO TechFlow'],
      ['Aux. Educação',         'Até R$ 800,00/mês (cursos, pós, certificações)',   'Portal Benefits'],
      ['PLR',                   '1 a 2 salários — avaliação semestral por metas',   'Contrato PLR'],
      ['Seguro de Vida',        '36× o salário bruto, cobertura para dependentes',  'Porto Seguro'],
      ['Equipamento',           'Notebook corporativo + periféricos completos',     'TI TechFlow'],
    ],
    [180, 235, 100]
  )

  footer(doc, 1, 4, TITLE)

  // ── P2 ───────────────────────────────────────────────────────────────────
  newPage(doc, TITLE, VERSION)

  h1(doc, '4. JORNADA DE TRABALHO E FÉRIAS')
  p(doc, 'A TechFlow adota o regime de jornada flexível de 8 horas diárias (40 horas semanais), com início entre 8h e 10h, conforme acordo com o gestor. O modelo híbrido é parte essencial da nossa cultura.')
  table(doc,
    ['Modalidade', 'Dias da Semana', 'Observação'],
    [
      ['Presencial obrigatório', 'Terça, Quarta e Quinta',     'Reuniões de squad e cerimônias ágeis'],
      ['Home office',            'Segunda e Sexta-feira',       'Disponibilidade equivalente ao presencial'],
      ['Banco de horas',         'Compensação no mesmo mês',    'Aprovação prévia do gestor'],
      ['Férias',                 '30 dias corridos (CLT)',       'Solicitar com 30 dias de antecedência'],
      ['Licença Maternidade',    '180 dias (empresa cidadã)',    'Prorrogação de 120 para 180 dias'],
      ['Licença Paternidade',    '20 dias corridos',            'Prorrogação pelo programa empresa cidadã'],
    ],
    [155, 170, 190]
  )
  p(doc, 'Ausências devem ser comunicadas ao gestor e ao RH com mínimo de 2 horas de antecedência por Slack (#rh-ausencias) ou pelo sistema interno. Ausências recorrentes sem justificativa serão tratadas conforme o Código de Conduta.')

  h1(doc, '5. MODELO HÍBRIDO — REGRAS DETALHADAS')
  ul(doc, [
    'Os dias presenciais obrigatórios (Ter/Qua/Qui) não podem ser trocados unilateralmente.',
    'Em situações excepcionais, a troca de um dia presencial deve ser solicitada ao gestor via Slack com 24h de antecedência.',
    'O colaborador em home office deve manter câmera ligada em reuniões formais (dailies, plannings, reviews).',
    'Workspace de home office deve ser adequado: boa conexão, local silencioso, sem interrupções em reuniões.',
    'A empresa fornece subsídio de R$ 150/mês para internet e energia no home office (solicitação via portal).',
    'Visitas a clientes ou eventos externos contam como presencial quando autorizadas pelo gestor.',
  ])

  h1(doc, '6. CÓDIGO DE CONDUTA E ÉTICA')
  p(doc, 'Todos os colaboradores devem conhecer e respeitar o Código de Ética e Conduta da TechFlow, disponível integralmente em portal.techflow.com.br/etica. Os princípios fundamentais são:')
  ul(doc, [
    'Confidencialidade absoluta de informações de clientes, projetos e estratégias da empresa.',
    'Respeito mútuo e tolerância zero para assédio moral, sexual ou discriminação de qualquer natureza.',
    'Uso responsável dos equipamentos, sistemas e acessos corporativos.',
    'Proibição de uso de propriedade intelectual da empresa para projetos pessoais ou concorrentes.',
    'Declaração de conflito de interesses para qualquer atividade externa remunerada.',
    'Canal de Denúncias Ético disponível 24h em canaletico.techflow.com.br (anônimo e seguro).',
  ])
  alertBox(doc, 'Violações ao Código de Ética são investigadas pelo RH e Jurídico. Dependendo da gravidade, as medidas vão de advertência formal até rescisão por justa causa, independentemente do nível hierárquico.')

  footer(doc, 2, 4, TITLE)

  // ── P3 ───────────────────────────────────────────────────────────────────
  newPage(doc, TITLE, VERSION)

  h1(doc, '7. DESENVOLVIMENTO E CARREIRA')
  p(doc, 'A TechFlow investe ativamente no crescimento técnico e profissional de seu time. Os programas disponíveis são:')
  ul(doc, [
    'TechFlow Academy — Plataforma interna com cursos, trilhas e certificações. Acesso em academy.techflow.com.br.',
    'Auxílio para certificações externas (AWS, GCP, Azure, Oracle, CKA, etc.) — até R$ 800/mês mediante aprovação.',
    'Mentoria individual — cada colaborador pode solicitar um mentor (tech lead ou sênior de outra área).',
    'TechTalks quinzenais — apresentações internas de 30 min às sextas (canal #techtalks no Slack).',
    'Participação em conferências — TDC, QCon, DevOpsDays, BrazilJS e afins, sujeito a orçamento anual.',
    'Plano de carreira revisado semestralmente com feedback 360° estruturado (ciclos em Maio e Novembro).',
    'Promoções baseadas em competências técnicas, comportamentais e impacto no negócio.',
  ])

  h1(doc, '8. FERRAMENTAS E SISTEMAS CORPORATIVOS')
  table(doc,
    ['Ferramenta', 'Finalidade', 'Acesso'],
    [
      ['Slack',         'Comunicação interna — padrão TechFlow',        'Automático no onboarding'],
      ['Jira',          'Gestão de projetos, bugs e sprints',            'Solicitação ao gestor'],
      ['Confluence',    'Documentação técnica e corporativa',            'Solicitação ao gestor'],
      ['GitHub',        'Repositórios de código (org: techflow-dev)',    'Solicitação ao DevOps'],
      ['1Password',     'Gerenciador de senhas corporativas',            'TI no Dia 1'],
      ['VPN',           'Acesso remoto seguro a sistemas internos',      'TI no Dia 1'],
      ['AWS Console',   'Infraestrutura cloud (quando necessário)',       'Aprovação de gestão + DevOps'],
      ['Grafana',       'Monitoramento de sistemas em produção',         'Solicitação ao DevOps'],
    ],
    [115, 225, 175]
  )

  h1(doc, '9. SAÚDE, SEGURANÇA E BEM-ESTAR')
  ul(doc, [
    'Programa TechFlow Wellness: parceria com academias Gympass (plano Silver) — sem custo para o colaborador.',
    'EAP (Employee Assistance Program): suporte psicológico confidencial com até 6 sessões/ano cobertas.',
    'Ergonomia: solicitações de cadeira, monitor e periféricos ergonômicos via TI (análise em até 5 dias úteis).',
    'Ginástica laboral virtual toda quarta às 8h30 (canal #wellness no Slack).',
    'Ambiente sem abuso: qualquer situação de assédio ou pressão excessiva deve ser reportada ao RH ou Canal Ético.',
    'Licenças para saúde mental incluídas na política de ausências sem desconto nos primeiros 3 dias/mês.',
  ])

  footer(doc, 3, 4, TITLE)

  // ── P4 ───────────────────────────────────────────────────────────────────
  newPage(doc, TITLE, VERSION)

  h1(doc, '10. CONTATOS E CANAIS OFICIAIS')
  table(doc,
    ['Área', 'Contato', 'Horário'],
    [
      ['RH Geral',          'rh@techflow.com.br | Ramal 101 | #rh-geral',         'Seg–Sex 9h–18h'],
      ['Onboarding',        'onboarding@techflow.com.br | Ramal 102',             'Seg–Sex 9h–18h'],
      ['Benefícios',        'beneficios@techflow.com.br | #rh-beneficios',        'Seg–Sex 9h–17h'],
      ['TI / Suporte',      'ti@techflow.com.br | #suporte-tecnico',              'Seg–Sex 8h–20h'],
      ['Segurança',         'seguranca@techflow.com.br | Ramal 115',              '24h (incidentes)'],
      ['DPO / LGPD',        'dpo@techflow.com.br',                               'Seg–Sex 9h–18h'],
      ['Canal Ético',       'canaletico.techflow.com.br (anônimo)',               '24h / 7 dias'],
      ['Gestão / Diretoria','gestao@techflow.com.br | Ramal 200',                'Seg–Sex 9h–18h'],
    ],
    [120, 260, 135]
  )

  h1(doc, '11. POLÍTICAS RELACIONADAS')
  ul(doc, [
    'Política de Segurança da Informação — obrigatória para todos os colaboradores.',
    'Política de Privacidade e LGPD — disponível em portal.techflow.com.br/lgpd.',
    'Política de Uso Aceitável de Recursos de TI — portal.techflow.com.br/ti-politica.',
    'Código de Ética e Conduta — portal.techflow.com.br/etica.',
    'Política de Home Office — portal.techflow.com.br/homeoffice.',
    'Regulamento Interno de PLR — disponível no RH mediante solicitação.',
  ])

  doc.moveDown(0.5)
  const yr = doc.y
  doc.rect(ML, yr, CW, 52).fill(P.navy)
  doc.fontSize(11).fillColor(P.white).font('Helvetica-Bold')
     .text('Este manual é revisado anualmente pelo time de RH e Jurídico.', ML + 12, yr + 8, { width: CW - 24, align: 'center' })
  doc.fontSize(9).fillColor('#90CAF9').font('Helvetica')
     .text('Versão vigente sempre disponível em portal.techflow.com.br/manual-funcionario', ML + 12, yr + 26, { width: CW - 24, align: 'center' })
  doc.fontSize(8).fillColor(P.mist)
     .text('Aprovado por: Diretoria de RH e Jurídico  |  Vigência: Maio/2026 — Abril/2027', ML + 12, yr + 40, { width: CW - 24, align: 'center' })
  doc.y = yr + 60

  footer(doc, 4, 4, TITLE)
  doc.end()
  console.log(`✓  ${out}`)
}

// ════════════════════════════════════════════════════════════════════════════
// DOCUMENTO 2 — POLÍTICA DE SEGURANÇA DA INFORMAÇÃO (4 páginas)
// ════════════════════════════════════════════════════════════════════════════
function gerarSeguranca() {
  const TITLE   = 'Política de Segurança da Informação'
  const VERSION = 'Versão 1.0  |  Classificação: Interno  |  Maio/2026'
  const doc     = doc_new()
  const out     = path.join(OUT, 'politica-seguranca-informacao.pdf')
  doc.pipe(fs.createWriteStream(out))

  // ── P1 ───────────────────────────────────────────────────────────────────
  header(doc, TITLE, VERSION)
  alertBox(doc, '⚠  CLASSIFICAÇÃO: INTERNO — Aplicável a todos os colaboradores, prestadores e parceiros com acesso a sistemas TechFlow. Descumprimento sujeito a medidas disciplinares.', P.yellow, P.amber)

  h1(doc, '1. OBJETIVO E ESCOPO')
  p(doc, 'Esta política estabelece os princípios, diretrizes e regras que regem a segurança das informações da TechFlow Solutions e de seus clientes. Seu objetivo é garantir a confidencialidade, integridade e disponibilidade de todos os ativos de informação.')
  p(doc, 'Aplica-se sem exceção a: colaboradores CLT e PJ, estagiários, prestadores de serviço, fornecedores com acesso a sistemas internos e parceiros com acesso a dados de clientes. O desconhecimento desta política não exime ninguém de suas responsabilidades.')

  h1(doc, '2. PRINCÍPIOS FUNDAMENTAIS')
  table(doc,
    ['Princípio', 'Descrição'],
    [
      ['Confidencialidade', 'Informações acessadas somente por pessoas explicitamente autorizadas.'],
      ['Integridade',       'Dados precisos, completos e protegidos contra alterações indevidas.'],
      ['Disponibilidade',   'Sistemas e informações acessíveis quando e onde necessário.'],
      ['Responsabilização', 'Toda ação em sistemas corporativos é registrada e rastreável.'],
      ['Conformidade LGPD', 'Tratamento de dados pessoais estritamente conforme Lei 13.709/2018.'],
      ['Mínimo Privilégio', 'Acesso concedido somente ao necessário para exercer a função.'],
    ],
    [135, 380]
  )

  h1(doc, '3. CLASSIFICAÇÃO DE INFORMAÇÕES')
  p(doc, 'Toda informação produzida, recebida ou tratada na TechFlow deve ser classificada conforme os níveis abaixo:')
  table(doc,
    ['Nível', 'Definição', 'Exemplos', 'Controles'],
    [
      ['🟢 Público',      'Divulgável externamente sem restrição',            'Site, vagas, releases',         'Nenhum especial'],
      ['🔵 Interno',      'Uso por colaboradores; não divulgar externamente',  'Manuais, políticas, reuniões',  'Acesso autenticado'],
      ['🟠 Confidencial', 'Acesso restrito a times específicos',              'Código-fonte, contratos, NDA',  'Need-to-know + log'],
      ['🔴 Restrito',     'Acesso somente por diretoria e gestores C-level',  'Financeiro, M&A, salários',     'MFA + aprovação'],
    ],
    [75, 155, 155, 130]
  )

  footer(doc, 1, 4, TITLE)

  // ── P2 ───────────────────────────────────────────────────────────────────
  newPage(doc, TITLE, VERSION)

  h1(doc, '4. REGRAS DE SENHAS E AUTENTICAÇÃO')
  ul(doc, [
    'Comprimento mínimo: 12 caracteres com letras maiúsculas, minúsculas, números e símbolos.',
    'Autenticação de dois fatores (2FA) obrigatória em todos os sistemas corporativos — sem exceção.',
    'Troca de senha a cada 90 dias; o sistema bloqueará o acesso se não renovada no prazo.',
    'Proibido compartilhar credenciais com qualquer pessoa, incluindo gestores e suporte de TI.',
    'Senhas jamais devem ser anotadas em locais visíveis ou enviadas por e-mail/chat.',
    'Uso obrigatório do 1Password corporativo para armazenamento de credenciais.',
    'Em caso de suspeita de comprometimento, alterar senha imediatamente e avisar TI.',
  ])

  h1(doc, '5. REGRAS DE EQUIPAMENTOS E DISPOSITIVOS')
  ul(doc, [
    'Bloqueio automático de tela após 5 minutos de inatividade (configuração obrigatória, não alterar).',
    'Proibido conectar pen drives, HDs externos ou qualquer dispositivo USB não homologado pelo TI.',
    'Criptografia de disco habilitada em todos os dispositivos (BitLocker no Windows, FileVault no macOS).',
    'Antivírus corporativo (CrowdStrike) deve estar ativo e nunca ser desabilitado.',
    'Atualizações de segurança do SO devem ser aplicadas em até 48h após disponibilização.',
    'Laptops não devem sair das instalações sem comunicação ao TI e autorização do gestor.',
    'Dispositivos perdidos ou furtados devem ser reportados ao TI em no máximo 1 hora.',
    'Impressão de documentos Confidenciais/Restritos requer justificativa e uso de impressora segura.',
  ])

  h1(doc, '6. ACESSO REMOTO E VPN')
  p(doc, 'Todo acesso a sistemas internos fora das instalações da TechFlow deve obrigatoriamente utilizar a VPN corporativa (FortiClient). As regras são:')
  ul(doc, [
    'VPN deve estar ativa antes de qualquer acesso a sistemas, repositórios ou dados internos.',
    'Proibido acessar sistemas corporativos por redes Wi-Fi públicas sem VPN ativa e habilitada.',
    'Split tunneling está desabilitado — todo o tráfego passa pela VPN durante a sessão.',
    'Sessões inativas por mais de 30 minutos são encerradas automaticamente.',
    'Credenciais VPN são pessoais, intransferíveis e protegidas por 2FA obrigatório.',
    'Conflitos de acesso ou instabilidade de VPN: reportar ao #suporte-tecnico imediatamente.',
  ])

  footer(doc, 2, 4, TITLE)

  // ── P3 ───────────────────────────────────────────────────────────────────
  newPage(doc, TITLE, VERSION)

  h1(doc, '7. USO ACEITÁVEL DE RECURSOS DE TI')
  ul(doc, [
    'Recursos corporativos (equipamento, internet, software) são para fins profissionais prioritariamente.',
    'Uso pessoal moderado e não interferente é tolerado (ex: navegação pessoal em horário de almoço).',
    'Proibido instalar software não homologado pelo TI sem aprovação formal prévia.',
    'Proibido uso de recursos corporativos para atividades ilegais, antiéticas ou concorrentes.',
    'Acesso a sites de conteúdo adulto, pirataria, jogos ou apostas é bloqueado e registrado.',
    'E-mails corporativos não devem ser usados para cadastro em serviços pessoais.',
    'Dados de clientes não podem ser armazenados em serviços pessoais (Google Drive, Dropbox pessoal, etc.).',
    'Uso de IA generativa (ChatGPT, Copilot) com dados de clientes é PROIBIDO sem validação do Jurídico.',
  ])

  h1(doc, '8. TRATAMENTO DE INCIDENTES DE SEGURANÇA')
  p(doc, 'Incidente de segurança é qualquer evento que comprometa ou possa comprometer a confidencialidade, integridade ou disponibilidade de informações ou sistemas TechFlow.')

  h2(doc, 'Exemplos de incidentes que DEVEM ser reportados imediatamente:')
  ul(doc, [
    'Acesso não autorizado a sistemas, contas ou dados de clientes.',
    'Recebimento de e-mail de phishing ou links suspeitos (mesmo que não clicado).',
    'Infecção por malware, ransomware ou comportamento anômalo em dispositivo.',
    'Perda ou furto de dispositivo corporativo contendo dados da empresa.',
    'Vazamento real ou suspeito de dados de clientes ou colaboradores.',
    'Violação de credenciais ou uso indevido de acesso por terceiros.',
  ])

  h2(doc, 'Procedimento de resposta:')
  ol(doc, [
    'Identifique o incidente — não tente resolver sozinho.',
    'Contate imediatamente: seguranca@techflow.com.br ou Ramal 115.',
    'Preserve evidências: não apague arquivos, logs ou e-mails suspeitos.',
    'Documente: horário, sistema afetado, ações realizadas antes da detecção.',
    'Aguarde orientação do time de Segurança antes de qualquer ação corretiva.',
    'Colabore integralmente com a investigação — sigilo sobre o incidente enquanto não resolvido.',
  ])

  footer(doc, 3, 4, TITLE)

  // ── P4 ───────────────────────────────────────────────────────────────────
  newPage(doc, TITLE, VERSION)

  h1(doc, '9. LGPD — PROTEÇÃO DE DADOS PESSOAIS')
  p(doc, 'A TechFlow atua como controladora e operadora de dados pessoais conforme a Lei Geral de Proteção de Dados (LGPD — Lei 13.709/2018). Todos os colaboradores são agentes de tratamento e têm responsabilidades diretas:')
  ul(doc, [
    'Tratar dados pessoais somente para as finalidades descritas e autorizadas.',
    'Nunca compartilhar dados de clientes, leads ou colaboradores sem necessidade comprovada e base legal.',
    'Solicitar ao DPO (dpo@techflow.com.br) aprovação para qualquer novo tratamento de dados pessoais.',
    'Excluir dados pessoais quando não houver mais necessidade de retenção.',
    'Reportar qualquer incidente envolvendo dados pessoais ao DPO em até 1 hora da detecção.',
    'Concluir o treinamento obrigatório de LGPD na TechFlow Academy (renovação anual).',
  ])

  h1(doc, '10. SEGURANÇA EM DESENVOLVIMENTO DE SOFTWARE')
  ul(doc, [
    'Dados reais de clientes nunca devem ser usados em ambientes de desenvolvimento ou homologação.',
    'Credenciais (API keys, senhas, tokens) não devem ser commitadas em repositórios — usar Vault ou Secrets Manager.',
    'Todo PR deve passar por code review de segurança para mudanças em autenticação, autorização e criptografia.',
    'Dependências de terceiros devem ser verificadas com Snyk/Dependabot antes de inclusão no projeto.',
    'Pentests e análises SAST obrigatórios antes do go-live de novos sistemas ou funcionalidades críticas.',
    'OWASP Top 10 deve ser considerado em todo desenvolvimento de APIs e aplicações web.',
  ])

  h1(doc, '11. PENALIDADES E VIGÊNCIA')
  p(doc, 'O descumprimento desta política acarreta medidas disciplinares proporcionais à gravidade da infração, podendo incluir advertência, suspensão ou rescisão por justa causa, além de responsabilização civil e criminal conforme legislação aplicável.')

  table(doc,
    ['Informação', 'Detalhe'],
    [
      ['Aprovação',   'Diretoria de Tecnologia, RH e Jurídico'],
      ['Vigência',    'Maio/2026 — revisão prevista: Maio/2027'],
      ['Responsável', 'Time de Segurança da Informação'],
      ['Contato',     'seguranca@techflow.com.br | Ramal 115'],
      ['DPO',         'dpo@techflow.com.br'],
    ],
    [120, 395]
  )

  footer(doc, 4, 4, TITLE)
  doc.end()
  console.log(`✓  ${out}`)
}

// ════════════════════════════════════════════════════════════════════════════
// DOCUMENTO 3 — CATÁLOGO DE SERVIÇOS 2026 (4 páginas)
// ════════════════════════════════════════════════════════════════════════════
function gerarCatalogo() {
  const TITLE   = 'Catálogo de Serviços 2026'
  const VERSION = 'Uso Interno — Equipe de Vendas e Pré-vendas'
  const doc     = doc_new()
  const out     = path.join(OUT, 'catalogo-servicos-2026.pdf')
  doc.pipe(fs.createWriteStream(out))

  // ── P1 ───────────────────────────────────────────────────────────────────
  header(doc, TITLE, VERSION)
  p(doc, 'Este catálogo descreve o portfólio completo da TechFlow Solutions para 2026, incluindo serviços, tecnologias, modelos de entrega e diferenciais competitivos. Destinado a uso interno das equipes de Vendas, Pré-vendas e Arquitetura.')

  h1(doc, '1. DESENVOLVIMENTO DE SOFTWARE SOB MEDIDA')
  h2(doc, 'Sistemas Web e Mobile')
  p(doc, 'Desenvolvemos plataformas completas com foco em performance, escalabilidade e experiência do usuário, utilizando as tecnologias mais modernas do mercado.')
  table(doc,
    ['Tecnologia', 'Camada', 'Casos de Uso'],
    [
      ['Quarkus 3 + Java 21',  'Backend',  'APIs REST/GraphQL, microsserviços, alta performance'],
      ['Next.js 15 + React',   'Frontend', 'SPAs, SSR, dashboards, portais'],
      ['Flutter 3',            'Mobile',   'Apps iOS e Android com codebase único'],
      ['PostgreSQL 16',        'Dados',    'Banco relacional com pgvector para IA'],
      ['Apache Kafka',         'Eventos',  'Streaming, filas, event-driven architecture'],
      ['Docker + Kubernetes',  'Infra',    'Containers, orquestração, cloud-native'],
    ],
    [150, 90, 275]
  )

  h2(doc, 'Plataformas SaaS')
  ul(doc, [
    'Arquitetura multi-tenant com isolamento de dados por cliente (row-level security).',
    'Módulos de billing integrados (Stripe, PagSeguro, Asaas) com gestão de planos.',
    'Onboarding self-service com wizard de configuração e trial automático.',
    'Dashboards analíticos em tempo real com Grafana ou charts customizados.',
    'Infraestrutura escalável na AWS (EKS, RDS, ElastiCache, S3) ou GCP.',
    'SLA de disponibilidade 99,9% com monitoramento e alertas 24x7.',
  ])

  footer(doc, 1, 4, TITLE)

  // ── P2 ───────────────────────────────────────────────────────────────────
  newPage(doc, TITLE, VERSION)

  h1(doc, '2. INTELIGÊNCIA ARTIFICIAL E AUTOMAÇÃO')
  h2(doc, 'Chatbots Corporativos com RAG (Produto Flagship)')
  p(doc, 'Nossa solução de chatbot com RAG (Retrieval-Augmented Generation) é o produto de maior diferencial competitivo da TechFlow. Permite que empresas criem assistentes que respondem com base em seus documentos internos, com segurança e precisão.')
  ul(doc, [
    'Stack: Java/Quarkus + LangChain4j + Ollama (LLM local) ou OpenAI/Groq/Anthropic.',
    'Vector Store: PostgreSQL com extensão pgvector para busca semântica de alta performance.',
    'Interface: Next.js 15 responsivo, modo claro/escuro, suporte a markdown nas respostas.',
    'Segurança: guardrails de prompt injection, rate limiting, autenticação JWT.',
    'Documentos suportados: PDF, Word, Excel, TXT, Markdown, HTML.',
    'Integrações: Slack, Microsoft Teams, WhatsApp Business API.',
    'Diferencial: roda 100% on-premise se necessário — dados nunca saem da infraestrutura do cliente.',
  ])

  h2(doc, 'Machine Learning e Análise Preditiva')
  table(doc,
    ['Solução', 'Aplicação', 'Tecnologia'],
    [
      ['Previsão de Demanda',   'Planejamento de estoque e compras',          'Python, Scikit-learn, Prophet'],
      ['Detecção de Fraude',    'Transações financeiras em tempo real',        'XGBoost, Kafka Streams'],
      ['Análise de Churn',      'Retenção proativa de clientes',              'LightGBM, MLflow'],
      ['Classificação de Texto','Categorização automática de documentos',     'BERT, spaCy, Hugging Face'],
      ['Computer Vision',       'Inspeção de qualidade industrial',           'YOLO, OpenCV, TensorFlow'],
    ],
    [150, 195, 170]
  )

  h1(doc, '3. MODERNIZAÇÃO DE SISTEMAS LEGADOS')
  p(doc, 'Especialidade histórica da TechFlow: migração segura e incremental de sistemas legados (COBOL, Delphi, sistemas monolíticos) para arquiteturas modernas, minimizando riscos e garantindo continuidade operacional.')
  ul(doc, [
    'Discovery completo: mapeamento de regras de negócio, integrações e dependências (2–4 semanas).',
    'Estratégias disponíveis: Strangler Fig, Lift-and-Shift, Rewrite Incremental por domínio.',
    'Migração para microsserviços com Quarkus e comunicação via REST/gRPC/Kafka.',
    'Adoção de padrões Cloud Native: 12-Factor App, observabilidade, GitOps.',
    'Cobertura de testes automatizados: unitários, integração e E2E antes da migração.',
    'Rollout gradual com feature flags e canary deployments para zero downtime.',
    'Monitoramento pós-migração com OpenTelemetry, Prometheus e alertas configurados.',
  ])

  footer(doc, 2, 4, TITLE)

  // ── P3 ───────────────────────────────────────────────────────────────────
  newPage(doc, TITLE, VERSION)

  h1(doc, '4. CONSULTORIA TÉCNICA')
  table(doc,
    ['Serviço', 'Entregável', 'Duração Típica'],
    [
      ['Arquitetura de Software',    'Documento de arquitetura + ADRs + diagrama C4',             '2–4 semanas'],
      ['DevOps e CI/CD',             'Pipelines, IaC com Terraform, Kubernetes setup',             '3–6 semanas'],
      ['Auditoria de Segurança',     'Relatório OWASP + pentest + plano de remediação',           '1–3 semanas'],
      ['Tech Due Diligence',         'Avaliação técnica de produto para M&A ou investimento',     '1–2 semanas'],
      ['Revisão de Performance',     'Profiling, otimização de queries e caching',                '1–2 semanas'],
      ['Workshop de Modernização',   'Roadmap técnico para migração ou refatoração',              '3–5 dias'],
    ],
    [165, 245, 105]
  )

  h1(doc, '5. SUPORTE E MANUTENÇÃO')
  p(doc, 'Os contratos de suporte TechFlow garantem evolução contínua e estabilidade dos sistemas entregues. Três níveis disponíveis:')

  const planos = [
    { nome: 'Essencial', cor: P.teal,  itens: ['Horário comercial (8h–18h)', 'SLA resposta: 8 horas', 'Correção de bugs críticos', 'Monitoramento básico'] },
    { nome: 'Business',  cor: P.blue,  itens: ['Horário estendido (7h–22h)', 'SLA resposta: 4 horas', 'Correções + melhorias mensais', 'Monitoramento avançado + alertas'] },
    { nome: 'Premium',   cor: P.navy,  itens: ['24x7x365', 'SLA resposta: 1 hora', 'Engenheiro sênior dedicado parcialmente', 'Roadmap de evolução trimestral'] },
  ]
  planos.forEach(pl => {
    const y = doc.y
    const h = 80
    doc.rect(ML, y, CW, h).fill(P.ice)
    doc.rect(ML, y, 6, h).fill(pl.cor)
    doc.fontSize(12).fillColor(pl.cor).font('Helvetica-Bold')
       .text(`Plano ${pl.nome}`, ML + 14, y + 8)
    pl.itens.forEach((it, i) => {
      doc.fontSize(9.5).fillColor(P.ink).font('Helvetica')
         .text(`• ${it}`, ML + 14, y + 26 + i * 13)
    })
    doc.y = y + h + 5
  })

  footer(doc, 3, 4, TITLE)

  // ── P4 ───────────────────────────────────────────────────────────────────
  newPage(doc, TITLE, VERSION)

  h1(doc, '6. PROCESSO DE ENGAJAMENTO')
  const etapas = [
    ['01', 'Discovery',        'Workshop de levantamento de requisitos, mapeamento de processos e definição de escopo. Duração: 1–3 dias.'],
    ['02', 'Proposta Técnica', 'Documento com arquitetura proposta, stack tecnológica, cronograma estimado e modelo de precificação.'],
    ['03', 'Kick-off',         'Onboarding do squad, setup de ambientes, ferramentas e alinhamento de governança do projeto.'],
    ['04', 'Sprints Ágeis',    'Ciclos de 2 semanas com demos ao cliente ao final de cada sprint e retrospectiva interna.'],
    ['05', 'UAT',              'Fase de testes de aceitação com o cliente. Critérios de aceite definidos previamente.'],
    ['06', 'Go-live',          'Deploy em produção com plano de rollback. Suporte dedicado nas primeiras 72 horas.'],
    ['07', 'Sustentação',      'Monitoramento contínuo, SLA ativo e reuniões mensais de acompanhamento (QBR).'],
  ]
  etapas.forEach(([n, t, d]) => stepBox(doc, parseInt(n), t, d))

  h1(doc, '7. CONTATO COMERCIAL E PRÉ-VENDAS')
  table(doc,
    ['Canal', 'Contato', 'Prazo de Resposta'],
    [
      ['Vendas Comercial',   'vendas@techflow.com.br | (11) 3456-7890',     'Até 4 horas úteis'],
      ['Pré-vendas / Técnico','prevendas@techflow.com.br | #prevendas',     'Até 8 horas úteis'],
      ['Parcerias',          'parcerias@techflow.com.br',                   'Até 2 dias úteis'],
      ['Site institucional', 'www.techflow.com.br (formulário de contato)', 'Até 1 dia útil'],
    ],
    [140, 245, 130]
  )

  footer(doc, 4, 4, TITLE)
  doc.end()
  console.log(`✓  ${out}`)
}

// ════════════════════════════════════════════════════════════════════════════
// DOCUMENTO 4 — PROCEDIMENTOS DE ONBOARDING (3 páginas)
// ════════════════════════════════════════════════════════════════════════════
function gerarOnboarding() {
  const TITLE   = 'Procedimentos de Onboarding'
  const VERSION = 'Novo Colaborador  |  TechFlow Solutions 2026'
  const doc     = doc_new()
  const out     = path.join(OUT, 'procedimentos-onboarding.pdf')
  doc.pipe(fs.createWriteStream(out))

  // ── P1 ───────────────────────────────────────────────────────────────────
  header(doc, TITLE, VERSION)

  const wy = doc.y
  doc.rect(ML, wy, CW, 42).fill(P.navy)
  doc.fontSize(16).fillColor(P.white).font('Helvetica-Bold')
     .text('Bem-vindo ao time TechFlow! 🚀', ML + 12, wy + 8, { width: CW - 24, align: 'center' })
  doc.fontSize(10).fillColor('#90CAF9').font('Helvetica')
     .text('Este guia descreve seu programa de integração das primeiras 4 semanas.', ML + 12, wy + 28, { width: CW - 24, align: 'center' })
  doc.y = wy + 52

  h1(doc, 'DIA 1 — BOAS-VINDAS E ESTRUTURA')
  table(doc,
    ['Horário', 'Atividade', 'Responsável'],
    [
      ['09h00', 'Recepção com o RH — assinatura de documentos e apresentação da empresa', 'RH'],
      ['10h00', 'Tour pelo escritório: salas, copa, áreas técnicas, espaços de descanso',  'RH / Facilities'],
      ['11h00', 'Entrega de notebook, crachá, cartão de acesso e periféricos',             'TI'],
      ['11h30', 'Setup inicial: e-mail, Slack, GitHub, 1Password e VPN',                  'TI'],
      ['12h00', 'Almoço de boas-vindas com gestor direto e equipe',                       'Gestor'],
      ['14h00', 'Leitura do Manual do Funcionário e Política de Segurança',               'Colaborador'],
      ['15h30', 'Reunião com gestor: expectativas iniciais e apresentação do squad',       'Gestor'],
      ['17h30', 'Check-in com RH: dúvidas do primeiro dia',                               'RH'],
    ],
    [55, 330, 130]
  )

  h1(doc, 'DIA 2 — AMBIENTE E FERRAMENTAS')
  ul(doc, [
    'Setup completo do ambiente de desenvolvimento: IDE (IntelliJ/VSCode), Docker Desktop, Git, Java 21.',
    'Treinamento de ferramentas: Slack (canais, etiqueta, canais obrigatórios), Jira (perfil, backlog) e Confluence.',
    'Configuração e teste da VPN corporativa — validação com o time de TI.',
    'Apresentação da arquitetura dos projetos do squad pelo tech lead.',
    'Primeiro acesso ao Jira: familiarização com o backlog, sprints ativas e processos do time.',
    'Sessão de pair programming (2h) com um colega sênior do squad.',
  ])

  footer(doc, 1, 3, TITLE)

  // ── P2 ───────────────────────────────────────────────────────────────────
  newPage(doc, TITLE, VERSION)

  h1(doc, 'DIAS 3 A 5 — INTEGRAÇÃO TÉCNICA')
  ul(doc, [
    'Daily standup com o squad às 9h30 — observar dinâmica e rotinas ágeis do time.',
    'Leitura da documentação de arquitetura no Confluence (espaço do squad).',
    'Reunião de alinhamento com tech lead: definição das metas técnicas dos primeiros 30 dias.',
    'Primeira tarefa técnica de baixa complexidade (warm-up task) atribuída pelo tech lead.',
    'Acesso ao repositório GitHub do projeto — clone, build e execução local confirmados.',
    'Revisão de 2 PRs do squad como observador — entendimento do processo de code review.',
    'Feedback formal ao final da primeira semana: 30 min com gestor (formato start/stop/continue).',
  ])

  h1(doc, 'SEMANAS 2 A 4 — RAMPA DE PRODUTIVIDADE')
  table(doc,
    ['Semana', 'Foco', 'Entregas Esperadas'],
    [
      ['Semana 2', 'Integração ao squad',      '2–3 tasks entregues, PRs criados e revisados, participação plena nas cerimônias'],
      ['Semana 3', 'Autonomia crescente',      'Tasks de média complexidade com mínima supervisão, primeiro code review como revisor'],
      ['Semana 4', 'Contribuição efetiva',     'Velocity equiparada ao time, definição de metas do mês 2, feedback da semana 4'],
    ],
    [65, 135, 315]
  )

  h1(doc, 'CHECKLIST DE ACESSOS — TI (Validar até o Dia 2)')
  const acessos = [
    'E-mail corporativo @techflow.com.br funcionando',
    'Slack — workspace techflow-solutions, canais obrigatórios: #geral, #engineering, #squad-[nome], #suporte-tecnico',
    'GitHub — organização techflow-dev, permissão ao repositório do squad',
    'Jira — perfil criado, visibilidade do backlog do squad',
    'Confluence — acesso ao espaço do squad e à documentação de arquitetura',
    'VPN corporativa (FortiClient) — instalado, configurado e testado',
    '1Password — conta corporativa criada, vault do squad acessível',
    'AWS Console (se aplicável) — acesso com mínimo privilégio, conforme papel',
    'TechFlow Academy — perfil criado, trilha de onboarding iniciada',
    'Ambiente de desenvolvimento local — build e testes passando',
  ]
  acessos.forEach(a => {
    const y = doc.y
    doc.rect(ML, y, 14, 14).stroke(P.blue)
    doc.fontSize(9.5).fillColor(P.ink).font('Helvetica')
       .text(a, ML + 22, y + 2, { width: CW - 22 })
    doc.moveDown(0.3)
  })

  footer(doc, 2, 3, TITLE)

  // ── P3 ───────────────────────────────────────────────────────────────────
  newPage(doc, TITLE, VERSION)

  h1(doc, 'PROGRAMA DE BUDDY (PARCEIRO DE INTEGRAÇÃO)')
  p(doc, 'Todo novo colaborador recebe um buddy — profissional experiente do time que acompanha a integração durante as primeiras 4 semanas. O buddy é indicado pelo gestor e deve ser de nível sênior ou pleno com pelo menos 1 ano de empresa.')
  table(doc,
    ['Período', 'Frequência de Contato', 'Duração'],
    [
      ['Semana 1', 'Reunião diária',       '15 min (início da manhã)'],
      ['Semana 2', 'Reunião diária',       '15 min (início da manhã)'],
      ['Semana 3', 'Reunião a cada 2 dias','20 min'],
      ['Semana 4', 'Reunião semanal',      '30 min + avaliação final'],
    ],
    [100, 200, 215]
  )
  ul(doc, [
    'O buddy está disponível no Slack para dúvidas técnicas e culturais do dia a dia.',
    'Não é papel do buddy avaliar o desempenho — apenas facilitar a integração.',
    'Ao final das 4 semanas, buddy e novo colaborador preenchem formulário de avaliação mútua.',
    'O programa de buddy é parte do KPI de satisfação do onboarding medido pelo RH.',
  ])

  h1(doc, 'PLANO 30/60/90 DIAS')
  table(doc,
    ['Marco', 'Objetivos', 'Indicadores de Sucesso'],
    [
      ['30 dias', 'Integração técnica e cultural completa; ambiente de dev 100% funcional', 'PRs aceitos, feedback positivo do gestor, trilha Academy concluída'],
      ['60 dias', 'Contribuição autônoma em tasks de média complexidade no squad',          'Velocity estabilizada, code reviews realizados, metas do mês definidas'],
      ['90 dias', 'Referência no domínio de responsabilidade; documentação contribuída',    'Entrega de funcionalidade relevante, apresentação de TechTalk interno'],
    ],
    [65, 225, 225]
  )

  h1(doc, 'CONTATOS DO ONBOARDING')
  infoBox(doc, 'RH — Onboarding',  'onboarding@techflow.com.br | Ramal 102 | #rh-onboarding')
  infoBox(doc, 'TI — Acessos',     'ti@techflow.com.br | Ramal 110 | #suporte-tecnico')
  infoBox(doc, 'Seu Gestor',       'Informado no contrato e e-mail de boas-vindas')
  infoBox(doc, 'Seu Buddy',        'Apresentado no Dia 1 pelo gestor')

  footer(doc, 3, 3, TITLE)
  doc.end()
  console.log(`✓  ${out}`)
}

// ════════════════════════════════════════════════════════════════════════════
// DOCUMENTO 5 — GLOSSÁRIO TÉCNICO E FAQ INTERNO (3 páginas)
// ════════════════════════════════════════════════════════════════════════════
function gerarGlossarioFaq() {
  const TITLE   = 'Glossário Técnico e FAQ Interno'
  const VERSION = 'TechFlow Solutions  |  Atualizado: Maio/2026'
  const doc     = doc_new()
  const out     = path.join(OUT, 'glossario-tecnico-faq.pdf')
  doc.pipe(fs.createWriteStream(out))

  // ── P1 ───────────────────────────────────────────────────────────────────
  header(doc, TITLE, VERSION)
  p(doc, 'Referência rápida dos principais termos técnicos utilizados nos projetos, documentos e comunicações internas da TechFlow Solutions. Mantenha este glossário à mão durante onboarding e revisões de arquitetura.')

  h1(doc, 'GLOSSÁRIO TÉCNICO')

  const termos = [
    ['Quarkus',        'Framework Java supersônico e subatômico, otimizado para Kubernetes e GraalVM native image. Stack principal do backend TechFlow para APIs REST, microsserviços e aplicações cloud-native.'],
    ['RAG',            'Retrieval-Augmented Generation. Técnica que combina busca semântica em vetores (embeddings) com geração de texto por LLMs, permitindo respostas embasadas em documentos específicos sem fine-tuning do modelo.'],
    ['LangChain4j',    'Biblioteca Java para construção de aplicações com LLMs (Large Language Models). Fornece abstrações para RAG, memória de conversa, ferramentas (tools), AI services e agentes autônomos.'],
    ['pgvector',       'Extensão do PostgreSQL para armazenar e buscar vetores de alta dimensão (embeddings). Permite queries de similaridade cosseno, distância euclidiana e produto interno diretamente no banco relacional.'],
    ['Embedding',      'Representação vetorial numérica de texto ou dado, gerada por modelos como nomic-embed-text ou text-embedding-ada-002. Permite busca semântica por proximidade no espaço vetorial.'],
    ['Ollama',         'Ferramenta para execução local de LLMs (llama3.2, mistral, gemma, etc.) sem dependência de APIs externas. Padrão TechFlow para ambientes de desenvolvimento e deployments on-premise.'],
    ['Kafka',          'Plataforma de streaming de eventos distribuído (Apache Kafka). Usada para comunicação assíncrona entre microsserviços, garantindo durabilidade e replay de eventos.'],
    ['OpenTelemetry',  'Padrão open-source para observabilidade: traces distribuídos, métricas e logs estruturados. Integrado ao Jaeger (traces), Prometheus (métricas) e Grafana (dashboards) na TechFlow.'],
    ['2FA',            'Autenticação de dois fatores. Segunda camada de segurança além da senha, usando app autenticador (Google Authenticator, Authy) ou chave de segurança física (YubiKey).'],
    ['VPN',            'Virtual Private Network. Túnel criptografado que protege o tráfego entre o dispositivo do colaborador e a infraestrutura interna TechFlow. Obrigatório para acesso remoto (FortiClient).'],
    ['ADR',            'Architecture Decision Record. Documento que registra uma decisão arquitetural importante: contexto, opções avaliadas, decisão tomada e consequências. Versionados no Confluence.'],
    ['LGPD',           'Lei Geral de Proteção de Dados (Lei 13.709/2018). Regulamenta tratamento de dados pessoais no Brasil. Define papéis (controlador, operador, encarregado/DPO) e direitos dos titulares.'],
    ['SLA',            'Service Level Agreement. Acordo formal de nível de serviço com tempos máximos de resposta e resolução garantidos contratualmente. Ex: SLA Premium = resposta em até 1 hora.'],
    ['Squad',          'Time multidisciplinar e autônomo com dev, QA, design e PO, responsável por um produto ou domínio de negócio. Estrutura organizacional padrão da TechFlow (inspiração Spotify Model).'],
    ['CI/CD',          'Continuous Integration / Continuous Deployment. Práticas de automação que garantem build, testes e deploy contínuos a cada commit. TechFlow usa GitHub Actions e GitLab CI.'],
    ['IaC',            'Infrastructure as Code. Gerenciamento de infraestrutura via código (Terraform, Pulumi). Permite versionamento, reproducibilidade e auditoria da infraestrutura cloud.'],
    ['DPO',            'Data Protection Officer (Encarregado de Dados). Responsável pela conformidade com a LGPD na TechFlow. Ponto de contato para questões de privacidade: dpo@techflow.com.br'],
    ['PLR',            'Participação nos Lucros e Resultados. Benefício variável da TechFlow, calculado semestralmente com base em metas individuais (peso 60%) e resultado da empresa (peso 40%).'],
  ]

  termos.forEach(([t, d]) => glossItem(doc, t, d))

  footer(doc, 1, 3, TITLE)

  // ── P2 ───────────────────────────────────────────────────────────────────
  newPage(doc, TITLE, VERSION)

  h1(doc, 'FAQ INTERNO — RH E BENEFÍCIOS')

  faqItem(doc, 'Como funciona o modelo híbrido de trabalho?',
    'Os dias presenciais obrigatórios são terça, quarta e quinta-feira. Segunda e sexta são home office. Trocas pontuais devem ser acordadas com o gestor com 24h de antecedência. Há um subsídio de R$ 150/mês para internet e energia no home office.')

  faqItem(doc, 'Qual é o processo para solicitar férias?',
    'Faça a solicitação em portal.techflow.com.br com pelo menos 30 dias de antecedência. O gestor tem 5 dias úteis para aprovar ou sugerir alternativa. As férias são de 30 dias corridos após 12 meses de contrato (CLT). Férias coletivas são comunicadas pelo RH com 60 dias de antecedência.')

  faqItem(doc, 'Como funciona o auxílio para certificações?',
    'O benefício é de até R$ 800/mês para certificações técnicas (AWS, GCP, Azure, Oracle, Kubernetes, etc.). Submeta a solicitação via portal.techflow.com.br/certificacoes com link do curso/exame e justificativa. O gestor aprova em até 3 dias úteis. Reprovação na prova não exige devolução do valor.')

  faqItem(doc, 'Como funciona o PLR (Participação nos Lucros)?',
    'O PLR é avaliado semestralmente (Junho e Dezembro). Peso: 60% metas individuais + 40% resultado da empresa. O valor histórico médio é de 1 a 2 salários brutos por ciclo. Os critérios e metas são divulgados no início de cada semestre pelo RH em reunião geral.')

  faqItem(doc, 'Posso fazer trabalho freelance fora da TechFlow?',
    'É permitido desde que: (1) não haja conflito de interesses com projetos ou clientes TechFlow; (2) não utilize propriedade intelectual, infraestrutura ou conhecimento confidencial da empresa; (3) não interfira na dedicação ao trabalho. Declare ao RH para transparência — o Código de Ética exige isso.')

  faqItem(doc, 'Como solicitar o subsídio de home office?',
    'O subsídio de R$ 150/mês para internet e energia é automático para quem está no regime híbrido. É creditado mensalmente junto com o salário. Para colaboradores 100% remotos (contratados específicos), o valor é de R$ 250/mês. Dúvidas: rh@techflow.com.br.')

  footer(doc, 2, 3, TITLE)

  // ── P3 ───────────────────────────────────────────────────────────────────
  newPage(doc, TITLE, VERSION)

  h1(doc, 'FAQ INTERNO — TI, SUPORTE E PROCESSOS')

  faqItem(doc, 'Como reportar um bug ou problema técnico nos sistemas internos?',
    'Abra um ticket no Jira (projeto SUPORTE) com: severidade (Crítico/Alto/Médio/Baixo), descrição, prints e passos para reproduzir. Para problemas críticos em produção: avise também no canal #incidentes do Slack e acione o on-call via PagerDuty. O time de TI responde em até 2 horas para Crítico.')

  faqItem(doc, 'Como solicitar acesso a um sistema ou repositório?',
    'Abra um ticket no Jira (projeto TI-ACESSOS) com a justificativa e o gestor aprovador. TI processa em até 1 dia útil. Para acessos em AWS, GCP ou sistemas de produção, é necessário aprovação adicional da gestão de segurança. Todos os acessos são revisados trimestralmente.')

  faqItem(doc, 'Posso usar ferramentas de IA generativa (ChatGPT, Copilot, etc.) no trabalho?',
    'Ferramentas de IA são incentivadas para aumentar produtividade, com uma restrição importante: NUNCA insira dados confidenciais de clientes, código proprietário ou informações restritas em serviços de IA externos. Para isso, use as ferramentas internas TechFlow (Aether Chatbot, Copilot corporativo homologado).')

  faqItem(doc, 'Como funciona o feedback e avaliação de desempenho?',
    'A TechFlow realiza ciclos formais de feedback a cada 6 meses (Maio e Novembro) usando o modelo 360°: autoavaliação + avaliação do gestor + peers do squad. Além disso, gestores e tech leads realizam 1:1s quinzenais de 30 min. Resultados impactam diretamente PLR e promoções.')

  faqItem(doc, 'Onde encontro a documentação dos projetos e processos internos?',
    'Documentação técnica e de processos está no Confluence (confluence.techflow.com.br), organizado por squad e domínio. ADRs ficam no espaço "Arquitetura TechFlow". Documentos de RH estão em portal.techflow.com.br. Para acesso a espaços específicos, solicite ao gestor ou abra ticket no #suporte-tecnico.')

  faqItem(doc, 'Como funciona o Canal Ético? É realmente anônimo?',
    'O Canal Ético (canaletico.techflow.com.br) é gerenciado por uma empresa terceira independente, garantindo anonimato total — nem o RH nem a diretoria TechFlow têm acesso à identidade do denunciante. Toda denúncia é investigada. Retaliação contra quem denuncia é falta gravíssima.')

  footer(doc, 3, 3, TITLE)
  doc.end()
  console.log(`✓  ${out}`)
}

// ── Main ─────────────────────────────────────────────────────────────────────
console.log('\n  TechFlow Solutions — Gerando documentos PDF v2...\n')
gerarManual()
gerarSeguranca()
gerarCatalogo()
gerarOnboarding()
gerarGlossarioFaq()
console.log('\n  Concluído! Arquivos em: ../documents/\n')