import { IndexPageTemplate } from "./views/commonIndexPageView";

new IndexPageTemplate({ currentFm: dv.current().file.frontmatter }, []).render();
