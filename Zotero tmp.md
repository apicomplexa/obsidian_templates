---
type: 📄paper
dg-publish: true
aliases: 
- "@{{citekey}}"
- "{{title}}"
title: "{{title}}"
citekey: {{citekey}}
{%- if DOI %}
DOI: {{DOI}}
{%- endif %}
{%- if ISBN %}
ISBN: {{ISBN}} 
{%- endif %}
author: 
{%-for creator in creators %}
- "{{creator.firstName}} {{creator.lastName}}"
{%-endfor %}
summary: "{{abstractNote}}"
file-path:
{%-for att in attachments %}
- "[{{att.title.replaceAll('_', ' ')}}]({{att.path.replaceAll("\\", "\\\\")}})"
{%-endfor%}
---
# {{title}}

> [!note]- Authors
{%- for creator in creators %}
> {{creator.creatorType}}:: {{creator.firstName}} {{creator.lastName}}
{%- endfor %}


>[!abstract]- Abstract note
> `$=dv.current().summary`

# Annotations
{{formattedAnnotations}}
# Files
{%- for att in attachments %}
[{{att.title.replaceAll('_', ' ')}}]({{att.path.replaceAll("\\", "\\\\")}})
{%- endfor -%}