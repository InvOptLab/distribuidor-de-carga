import { Module } from "../_types/docs";

export const documentationDataEN: Module[] = [
  {
    id: "importacao-dados",
    title: "Data Management and Import",
    icon: "dashboard",
    chapters: [
      {
        id: "carregar-dados",
        title: "Loading your Data",
        sections: [
          { id: "como-importar", title: "How to import a file" },
          { id: "substituicao-dados", title: "Replacement and Backup" },
        ],
        content: [
          {
            type: "heading",
            id: "como-importar",
            content: "Como importar um arquivo",
            level: 2,
          },
          {
            type: "text",
            content:
              "The first step to use the Workload Distributor is to feed the system with your institution's database, containing the teachers and classes for the semester.",
          },
          {
            type: "stepper",
            steps: [
              {
                label: "Access the Import page",
                description:
                  "In the top menu, click on 'DATA' and then on the 'Load Data' option.",
              },
              {
                label: "Select the File",
                description:
                  "Drag and drop your JSON file into the dotted area, or click on it to open your computer's file explorer.",
              },
              {
                label: "Wait for Processing",
                description:
                  "The system will read and validate the document to ensure the data structure is correct.",
              },
            ],
          },
          {
            type: "image",
            src: "/guia/carregar-dados/carregar-dados.png",
            alt: "[Image Space: File Upload Screen with the dotted card]",
            caption:
              "Figure 1: Drag and drop files area on the Import screen.",
          },
          {
            type: "heading",
            id: "substituicao-dados",
            content: "Substituição e Backup",
            level: 2,
          },
          {
            type: "text",
            content:
              "If you already have data loaded in your current session and try to send a new file, the system will issue a security alert.",
          },
          {
            type: "callout",
            severity: "warning",
            title: "Attention when Replacing Data",
            content:
              "Loading a new file will permanently delete the teachers, classes, and assignments currently in the browser's memory. We always recommend using the 'Backup' button in the warning window before proceeding.",
          },
          {
            type: "video",
            videoUrl: "https://www.youtube.com/embed/qrlRUmIRWYc",
            caption:
              "Video 1: Demonstration of the security alert and the recommended process for creating a backup before replacing data.",
          },
        ],
      },
    ],
  },
  {
    id: "visualizacoes",
    title: "Assignments Environment",
    icon: "assignment",
    chapters: [
      {
        id: "visao-tabela",
        title: "Table View (Main)",
        sections: [
          { id: "tabela-overview", title: "Overview and Action Bar" },
          { id: "filtros-tabela", title: "Filters and Searches" },
          { id: "acoes-atribuicao", title: "Grid Actions" },
          { id: "historico-exportacao", title: "History and Export" },
          { id: "padrao-cores", title: "Understanding Colors" },
          { id: "travas-manuais", title: "Inserting Manual Locks" },
        ],
        content: [
          {
            type: "heading",
            id: "tabela-overview",
            content: "Visão Geral e Barra de Ações",
            level: 2,
          },
          {
            type: "text",
            content:
              "The Table View (Assignments Grid) is the heart of the system. In it, you visualize the complete intersection between Teachers (rows) and Classes (columns), as well as control the optimization engine through the top toolbar.",
          },
          {
            type: "image",
            src: "/guia/visualizacoes/visao-tabela/tela-tabela.png",
            alt: "[Image Space: Overview of the Assignments Table with the Action Bar highlighted]",
            caption:
              "Figure 2: Main interface of the Assignments Table and its toolbar.",
          },
          {
            type: "heading",
            id: "filtros-tabela",
            content: "Filtros e Buscas",
            level: 2,
          },
          {
            type: "text",
            content:
              "To facilitate navigation in very extensive grids, use the 'Filters' button (funnel icon) in the top bar. The right side panel will open offering the following options:",
          },
          {
            type: "list",
            ordered: false,
            items: [
              "Teacher Filters: Search by teacher name or apply specific rules.",
              "Class Filters: Search by class code or subject name.",
              "Quick Clear: You can remove all active filters at any time to return to the full grid view.",
            ],
          },
          {
            type: "heading",
            id: "acoes-atribuicao",
            content: "Grid Actions (Executing and Clearing)",
            level: 2,
          },
          {
            type: "text",
            content:
              "In the action bar, you will find direct controls that affect table data:",
          },
          {
            type: "list",
            ordered: true,
            items: [
              "Execute Algorithm: Represented by the 'Play' icon, this button triggers the optimization process that will distribute the load automatically based on priorities and restrictions.",
              "Clear Assignments: Represented by the 'Broom' icon, it removes all current assignments from the grid, allowing you to restart the process from scratch (manual locks are not affected by default).",
              "Save to History (Floppy Disk icon): Saves the current grid configuration in the system memory. Already saved solutions disable this button to prevent duplication.",
              "Download (Down Arrow icon): Downloads the current grid as a file (JSON) to your computer.",
            ],
          },
          {
            type: "heading",
            id: "padrao-cores",
            content: "Understanding Colors (Visual Feedback)",
            level: 2,
          },
          {
            type: "text",
            content:
              "The table is designed to provide quick information through a dynamic color system in its cells and texts:",
          },
          {
            type: "list",
            ordered: false,
            items: [
              "Shades of Green in Cells: Indicate the level of preference/priority filled in the form. The intensity of the green varies according to the assigned priority.",
              "Gray: Visually represents a 'Lock' applied to an empty cell (i.e., the teacher was locked to that class and cannot be assigned to it).",
              "Grayish Red: Represents a Locked Assignment (the teacher has been assigned to the class and this assignment will not be changed).",
              "Teacher Cell in Red: Critical warning for Schedule Conflict. Indicates that the teacher in question has been assigned to classes whose schedules overlap.",
            ],
          },
          {
            type: "heading",
            id: "travas-manuais",
            content: "Inserindo Travas Manuais",
            level: 2,
          },
          {
            type: "text",
            content:
              "The 'Lock' fixes a relationship between a Teacher and a Class. By locking a cell, you prevent the optimization algorithm from removing or modifying that assignment during execution.",
          },
          {
            type: "callout",
            severity: "info",
            title: "How to apply a Lock",
            content:
              "To lock (or unlock) an assignment, simply locate the intersection cell between the Teacher and the desired Class, hold the 'Ctrl' key (or 'Cmd' on Mac) on your keyboard and click on the cell (Ctrl + Click). The cell will change color (to gray or grayish red) indicating that the lock has been applied successfully.",
          },
          {
            type: "gif",
            src: "/guia/visualizacoes/visao-tabela/tabela-travas.gif",
            alt: "[GIF Space: Showing the user holding Ctrl and clicking cells, columns, and rows to apply different locks]",
            caption:
              "Animation 1: Demonstration of the use of manual locks (Ctrl + Click) in multiple scopes: on an empty cell, on an existing assignment, on an entire column (subject), and on a row (teacher).",
          },
        ],
      },
      {
        id: "visao-bloco",
        title: "Blocks View",
        sections: [
          { id: "blocos-navegacao", title: "Overview and Dynamic Navigation" },
          {
            id: "blocos-docentes",
            title: "Teacher Cards and Teaching Load",
          },
          {
            id: "blocos-turmas",
            title: "Class Cards and Conflict Alerts",
          },
          { id: "blocos-acoes", title: "Assignments and Locks on Cards" },
        ],
        content: [
          {
            type: "heading",
            id: "blocos-navegacao",
            content: "Visão Geral e Navegação Dinâmica",
            level: 2,
          },
          {
            type: "text",
            content:
              "The Blocks View offers an agile card-based interface, ideal for managing assignments with a strong visual focus. Its main feature is deep navigation (Drill-down):",
          },
          {
            type: "list",
            ordered: false,
            items: [
              "Focus on the Teacher: By clicking on a Teacher's card, the screen transitions to show only the Classes related to that teacher (those they already teach and those they have a preference for).",
              "Focus on the Class: Conversely, by clicking on a Class card, the screen transitions to show all Teachers who have compatibility or preference for that class.",
              "Breadcrumbs Trail: At the top of the screen, a visual trail allows you to see exactly where you are (e.g., Teacher John -> Calculus Class) and easily go back to previous screens.",
            ],
          },
          {
            type: "video",
            videoUrl: "https://www.youtube.com/embed/Du95oeU7uXc",
            caption:
              "Video 2: Demonstration of dynamic deep navigation (drill-down). The flow illustrates the transition from 'Anonymous Subject 50' to the profile of 'Teacher 21', followed by the exploration of 'Anonymous Subject 43'.",
          },
          {
            type: "heading",
            id: "blocos-docentes",
            content: "Cartões de Docentes e Carga Didática",
            level: 2,
          },
          {
            type: "text",
            content:
              "The Teacher's card summarizes the teacher's current status in the semester. The interface provides immediate visual feedback on their workload:",
          },
          {
            type: "image",
            src: "/guia/visualizacoes/visao-bloco/bloco-docente-carga-limite.png",
            alt: "[Image Space: A teacher's card with the red progress bar indicating overload]",
            caption:
              "Figure 3: Example of a Teacher Card detailing the teaching load.",
          },
          {
            type: "list",
            ordered: false,
            items: [
              "Teaching Load Bar: A horizontal progress bar shows the proportion of teaching load assigned in relation to the teacher's maximum limit. If the load exceeds the limit, the bar instantly turns Red to warn of the overload.",
              "Balance and Priorities: Colored labels (Chips) indicate the teacher's hour balance (green for positive, red for negative) and their priority level (only for filled forms).",
            ],
          },
          {
            type: "heading",
            id: "blocos-turmas",
            content: "Cartões de Turmas e Alertas de Conflito",
            level: 2,
          },
          {
            type: "text",
            content:
              "Class cards present essential information such as code, course, period (moon icon for night classes), and language (if taught in English). The system monitors schedule integrity in real time:",
          },
          {
            type: "callout",
            severity: "error",
            title: "Schedule Conflict Alert",
            content:
              "If a teacher is assigned to two classes that occur on the same day and time, the Class card assumes a critical alert state: the card's border turns red and a warning icon (Triangle with exclamation mark) appears in the top right corner.",
          },
          {
            type: "heading",
            id: "blocos-acoes",
            content: "Atribuições e Travas nos Cartões",
            level: 2,
          },
          {
            type: "text",
            content:
              "Unlike the Table View, where actions are done in the cells, in the Blocks View, management actions are carried out directly in the footer of each card:",
          },
          {
            type: "stepper",
            steps: [
              {
                label: "Add or Remove Assignment",
                description:
                  "Click the blue Plus (+) icon in the footer of the card to assign the class to the teacher. If the class is already assigned, the button changes to a red Minus (-) icon to remove the assignment.",
              },
              {
                label: "Lock Assignment",
                description:
                  "Click the Padlock icon to fix the assignment. The padlock will close, and the card will gain an orange background and border, with a padlock icon in the upper corner, indicating that the algorithm will not be able to change this relationship.",
              },
              {
                label: "Unlock",
                description:
                  "Just click the Padlock icon again (now open) to remove the manual restriction and give freedom back to the optimization engine.",
              },
            ],
          },
          {
            type: "gif",
            src: "/guia/visualizacoes/visao-bloco/bloco-atrubuicao-trava.gif",
            alt: "[GIF Space: Showing the mouse clicking the + button and then the padlock in the footer of Teacher 35's card]",
            caption:
              "Animation 2: Making an assignment followed by a manual lock using the quick action controls in the footer of the 'Teacher 35' card.",
          },
        ],
      },
      {
        id: "visao-planilha",
        title: "Spreadsheet View",
        sections: [
          { id: "planilha-overview", title: "Overview and Bulk Editing" },
          {
            id: "planilha-colunas",
            title: "Column Management and Sorting",
          },
          { id: "planilha-exportacao", title: "Export to Excel" },
        ],
        content: [
          {
            type: "heading",
            id: "planilha-overview",
            content: "Visão Geral e Edição em Massa",
            level: 2,
          },
          {
            type: "text",
            content:
              "The Spreadsheet View offers a dense data interface, inspired by Microsoft Excel or Google Sheets. It was designed for times when you need to view many properties of the classes at once or make quick targeted edits.",
          },
          {
            type: "image",
            src: "/guia/visualizacoes/visao-planilha/planilha-atribuicoes-todos-campos.png",
            alt: "[Image Space: Overview of the spreadsheet-style table with multiple open columns]",
            caption:
              "Figure 4: Spreadsheet View interface with detailed tabular data.",
          },
          {
            type: "text",
            content:
              "In this interface, assignment editing happens directly in the corresponding cell, without the need to navigate to other screens:",
          },
          {
            type: "stepper",
            steps: [
              {
                label: "Locate the Teachers Cell",
                description:
                  "In the row of the desired class, find the 'Teachers' column and click on it.",
              },
              {
                label: "Select or Remove",
                description:
                  "A quick selection window (Dialog) will open, listing all available teachers. You can check new teachers for the class or uncheck current ones.",
              },
              {
                label: "Automatic Update",
                description:
                  "Upon confirmation, the cell is updated instantly, and the system accounts for the new teaching load in the background.",
              },
            ],
          },
          {
            type: "heading",
            id: "planilha-colunas",
            content: "Gerenciamento e Ordenação de Colunas",
            level: 2,
          },
          {
            type: "text",
            content:
              "Since classes have many attributes (Shift, Level, Schedules, Course, Load, etc.), the spreadsheet allows you to completely customize your working view.",
          },
          {
            type: "list",
            ordered: false,
            items: [
              "Hide and Show Columns: On the top bar, click the 'Manage Columns' button to open the Column Manager. Use the switches to hide information that is not useful at the moment, clearing your workspace.",
              "Quick Sort: Click on the title (header) of any column to sort the data alphabetically or numerically. A second click reverses the order (ascending/descending).",
            ],
          },
          {
            type: "gif",
            src: "/guia/visualizacoes/visao-planilha/planilha-ocultar-colunas.gif",
            alt: "[GIF Space: Using the Column Manager to hide the Course and Level columns, compressing the table]",
            caption:
              "Animation 3: Using the Column Manager to focus only on hiding the Course and Level columns.",
          },
          {
            type: "heading",
            id: "planilha-exportacao",
            content: "Export to Excel (.xlsx)",
            level: 2,
          },
          {
            type: "text",
            content:
              "If you need to present the grid to the department management or perform external analyses, you can use the native export module.",
          },
          {
            type: "callout",
            severity: "success",
            title: "Reliable Export",
            content:
              "The 'Export Spreadsheet' button generates an .xlsx file that exactly respects your current view. If you hid the 'Schedules' column and sorted the table by 'Workload', the generated Excel will come without the schedules column and sorted by load. What you see is what you export.",
          },
        ],
      },
    ],
  },
];
