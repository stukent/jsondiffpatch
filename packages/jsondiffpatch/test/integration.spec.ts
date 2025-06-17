/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as crypto from 'crypto';
import * as jsondiffpatch from '../src/index.js';

export function getItemId(obj: any): string | null {
  if (!obj || typeof obj !== 'object') return null
  if ('$id' in obj && typeof obj.$id === 'string') return obj.$id
  if ('id' in obj && typeof obj.id === 'string') return obj.id
  if ('key' in obj && typeof obj.key === 'string') return obj.key

  return null
}

let instance: jsondiffpatch.DiffPatcher;
beforeAll(function () {
  instance = jsondiffpatch.create({
    objectHash(obj: Record<string, any>) {
      const itemId = getItemId(obj)
      if (itemId) return itemId

      // This is probably inefficient, but the only time we are creating diffs is inside the recorder,
      // so we can afford for that to be slow in the name of speeding everything else up.
      const sortedKeys = Object.keys(obj).sort()
      const sortedObj: Record<string, any> = {}
      for (const key of sortedKeys) {
        const value = obj[key]
        // We only want shallow keys to generate the hash with.
        if (value && typeof value === 'object') continue
        if (value && Array.isArray(value)) continue
        sortedObj[key] = obj[key]
      }
      return crypto.createHash('sha256').update(JSON.stringify(sortedObj)).digest('hex')
    },
    arrays: {
      detectMove: true,
      includeValueOnMove: true,
    },
    cloneDiffValues: true,
  })
});

it('patches and unpatches array elements being created', () => {
  const before = {
    $localState: {
      lastSerializedSelection: {
        indexPaths: [[24]],
      }
    }
  }
  const after = {
    $localState: {
      lastSerializedSelection: {
        indexPaths: [[27]],
      }
    }
  }
  const diff = instance.diff(before, after)
  console.info(JSON.stringify(diff, null, 2))
  const patched = instance.patch(JSON.parse(JSON.stringify(before)), diff)
  expect(patched).toEqual(after)

  const unpatched = instance.unpatch(patched, diff)
  expect(unpatched).toEqual(before)
  console.info(unpatched)

  const otherAfter = {
    $localState: {
      lastSerializedSelection: {
        anchor: { foo: 'bar' },
        other: { foo: 'far' },
        type: 'RangeSelection',
      }
    }
  }
  const otherUnpatched = instance.unpatch(otherAfter, diff)
  expect(otherUnpatched).toEqual({
    $localState: {
      lastSerializedSelection: {
        anchor: { foo: 'bar' },
        other: { foo: 'far' },
        type: 'RangeSelection',
        indexPaths: [[24]],
      }
    }
  })
  console.info(otherUnpatched)
})

it('label error', () => {
  const before = {
    "word": {
        "editorValue": {
            "root": {
                "type": "root",
                "format": "",
                "indent": 0,
                "version": 1,
                "children": [
                    {
                        "$id": "c1Cz-OBaR2",
                        "type": "paragraph",
                        "cStyle": null,
                        "format": "",
                        "indent": 0,
                        "version": 1,
                        "children": [],
                        "direction": null,
                        "textFormat": 0
                    },
                    {
                        "$id": "hLmn71CwQc",
                        "rect": {
                            "x": 391,
                            "y": 0,
                            "width": 400,
                            "height": 100
                        },
                        "type": "shape",
                        "order": 4,
                        "anchor": "move",
                        "cStyle": {
                            "fontSize": 42
                        },
                        "format": "",
                        "indent": 0,
                        "altText": null,
                        "version": 1,
                        "children": [
                            {
                                "$id": "subJ7YRr-E",
                                "type": "paragraph",
                                "cStyle": {
                                    "fontFamily": "Gill Sans",
                                    "fontSize": 28
                                },
                                "format": "",
                                "indent": 0,
                                "version": 1,
                                "children": [
                                    {
                                        "$id": "Bih5D3o-g2",
                                        "mode": "normal",
                                        "text": "John Doe",
                                        "type": "text",
                                        "style": "",
                                        "cStyle": null,
                                        "detail": 0,
                                        "format": 0,
                                        "version": 1
                                    }
                                ],
                                "direction": null,
                                "textFormat": 0
                            }
                        ],
                        "wrapping": "square",
                        "direction": null,
                        "isDecorative": null
                    },
                    {
                        "$id": "d69nqR5gbf",
                        "rect": {
                            "x": 0,
                            "y": 0,
                            "width": 400,
                            "height": 100
                        },
                        "type": "shape",
                        "order": 2,
                        "anchor": "move",
                        "cStyle": {
                            "fontSize": 42,
                            "textFill": {
                                "type": "Solid",
                                "color": "#F6C6AD"
                            },
                            "fontWeight": "bold",
                            "textStrokeColor": "#EC844E",
                            "textStrokeStyle": "solid",
                            "textStrokeWidth": 2
                        },
                        "format": "",
                        "indent": 0,
                        "altText": null,
                        "version": 1,
                        "children": [
                            {
                                "$id": "fi6U_ULcWo",
                                "type": "paragraph",
                                "cStyle": {
                                    "textStrokeColor": "$text-dark-1",
                                    "textStrokeWidth": 2
                                },
                                "format": "",
                                "indent": 0,
                                "version": 1,
                                "children": [
                                    {
                                        "$id": "JsE139dL6g",
                                        "mode": "normal",
                                        "text": "This is a name",
                                        "type": "text",
                                        "style": "",
                                        "cStyle": {
                                            "fontFamily": "Impact",
                                            "fontSize": 48,
                                            "color": "#00B0F0",
                                            "shadowBlur": 3,
                                            "shadowColor": "rgba(0,0,255,0.5)",
                                            "shadowOffsetX": 3,
                                            "shadowOffsetY": 3
                                        },
                                        "detail": 0,
                                        "format": 0,
                                        "version": 1
                                    },
                                    {
                                        "$id": "Qlz49OJDzz",
                                        "mode": "normal",
                                        "text": " ",
                                        "type": "text",
                                        "style": "",
                                        "cStyle": null,
                                        "detail": 0,
                                        "format": 0,
                                        "version": 1
                                    }
                                ],
                                "direction": null,
                                "textFormat": 0
                            }
                        ],
                        "wrapping": "square",
                        "direction": null,
                        "isDecorative": null
                    },
                    {
                        "$id": "H_Ivj2cRFy",
                        "type": "paragraph",
                        "cStyle": null,
                        "format": "",
                        "indent": 0,
                        "version": 1,
                        "children": [],
                        "direction": null,
                        "textFormat": 0
                    },
                    {
                        "$id": "8w4QiImJT_",
                        "type": "paragraph",
                        "cStyle": null,
                        "format": "start",
                        "indent": 0,
                        "version": 1,
                        "children": [],
                        "direction": null,
                        "textFormat": 0
                    },
                    {
                        "$id": "BHJD-GbavQ",
                        "type": "paragraph",
                        "cStyle": {
                            "textAlign": "left"
                        },
                        "format": "start",
                        "indent": 0,
                        "version": 1,
                        "children": [
                            {
                                "$id": "c57nazDQPs",
                                "mode": "normal",
                                "text": "Working in an office offers several advantages over a fast food restaurant. Office jobs generally provide a more stable and comfortable environment with regular hours, better pay, and benefits like health insurance and retirement plans. The work is often less physically demanding and can offer opportunities for career advancement and professional development. Office roles typically provide a more conducive setting for focused, specialized tasks, enhancing skills in areas like project management, communication, and technology. Additionally, office jobs usually offer better work-life balance, more structured breaks, and opportunities for networking and collaboration with a diverse range of professionals.",
                                "type": "text",
                                "style": "",
                                "cStyle": null,
                                "detail": 0,
                                "format": 0,
                                "version": 1
                            }
                        ],
                        "direction": null,
                        "textFormat": 0
                    },
                    {
                        "$id": "N2j_jXswfY",
                        "src": "/app-sims-filesystem/0d9db95b4ec172db443d8497cf62b4af",
                        "crop": null,
                        "rect": {
                            "x": 96,
                            "y": 9,
                            "width": 288,
                            "height": 193
                        },
                        "type": "image",
                        "order": 1,
                        "anchor": "move",
                        "cStyle": null,
                        "format": "",
                        "indent": 0,
                        "altText": null,
                        "version": 1,
                        "children": [],
                        "cropPath": null,
                        "wrapping": "through",
                        "direction": null,
                        "aspectRatio": 1.4974226804123711,
                        "naturalSize": [
                            581,
                            388
                        ],
                        "isDecorative": null,
                        "isFromShapeNode": null,
                        "backgroundRemoveMask": null
                    },
                    {
                        "$id": "7O3UsxhaOx",
                        "type": "paragraph",
                        "cStyle": null,
                        "format": "start",
                        "indent": 0,
                        "version": 1,
                        "children": [
                            {
                                "$id": "wUL7yw-aVr",
                                "mode": "normal",
                                "text": "Communication Skills",
                                "type": "text",
                                "style": "",
                                "cStyle": null,
                                "detail": 0,
                                "format": 1,
                                "version": 1
                            },
                            {
                                "$id": "Y6EBfhvZ36",
                                "mode": "normal",
                                "text": ": The ability to clearly and effectively convey information, both in writing and verbally, is crucial for collaborating with colleagues, clients, and stakeholders.",
                                "type": "text",
                                "style": "",
                                "cStyle": null,
                                "detail": 0,
                                "format": 0,
                                "version": 1
                            }
                        ],
                        "direction": null,
                        "textFormat": 1
                    },
                    {
                        "$id": "TpaQA85_Tq",
                        "type": "paragraph",
                        "cStyle": null,
                        "format": "start",
                        "indent": 0,
                        "version": 1,
                        "children": [
                            {
                                "$id": "LBU3mxvcIO",
                                "mode": "normal",
                                "text": "Time Management",
                                "type": "text",
                                "style": "",
                                "cStyle": null,
                                "detail": 0,
                                "format": 1,
                                "version": 1
                            },
                            {
                                "$id": "GTqQe79Xsw",
                                "mode": "normal",
                                "text": ": Efficiently organizing and prioritizing tasks to meet deadlines and maintain productivity is essential in a busy office environment.",
                                "type": "text",
                                "style": "",
                                "cStyle": null,
                                "detail": 0,
                                "format": 0,
                                "version": 1
                            }
                        ],
                        "direction": null,
                        "textFormat": 1
                    },
                    {
                        "$id": "ZlIVzNEOGk",
                        "type": "paragraph",
                        "cStyle": null,
                        "format": "start",
                        "indent": 0,
                        "version": 1,
                        "children": [
                            {
                                "$id": "eQxF6L23iB",
                                "mode": "normal",
                                "text": "Technical Proficiency",
                                "type": "text",
                                "style": "",
                                "cStyle": null,
                                "detail": 0,
                                "format": 1,
                                "version": 1
                            },
                            {
                                "$id": "LLAJI7WgTj",
                                "mode": "normal",
                                "text": ": Competence with office software (such as Microsoft Office Suite) and familiarity with relevant technology and tools are necessary for most office roles.",
                                "type": "text",
                                "style": "",
                                "cStyle": null,
                                "detail": 0,
                                "format": 0,
                                "version": 1
                            }
                        ],
                        "direction": null,
                        "textFormat": 1
                    },
                    {
                        "$id": "TgJfo18lII",
                        "type": "paragraph",
                        "cStyle": null,
                        "format": "start",
                        "indent": 0,
                        "version": 1,
                        "children": [
                            {
                                "$id": "PD-cYlL0bt",
                                "mode": "normal",
                                "text": "Problem-Solving Abilities",
                                "type": "text",
                                "style": "",
                                "cStyle": null,
                                "detail": 0,
                                "format": 1,
                                "version": 1
                            },
                            {
                                "$id": "DmXHQbhjEr",
                                "mode": "normal",
                                "text": ": The capacity to analyze situations, identify issues, and develop effective solutions is vital for overcoming challenges and improving processes.",
                                "type": "text",
                                "style": "",
                                "cStyle": null,
                                "detail": 0,
                                "format": 0,
                                "version": 1
                            }
                        ],
                        "direction": null,
                        "textFormat": 1
                    },
                    {
                        "$id": "awT1AnzXuM",
                        "type": "paragraph",
                        "cStyle": null,
                        "format": "start",
                        "indent": 0,
                        "version": 1,
                        "children": [
                            {
                                "$id": "mbcSVtLYsr",
                                "mode": "normal",
                                "text": "Teamwork",
                                "type": "text",
                                "style": "",
                                "cStyle": null,
                                "detail": 0,
                                "format": 1,
                                "version": 1
                            },
                            {
                                "$id": "YHPsUdB1Di",
                                "mode": "normal",
                                "text": ": Working well with others, contributing to group efforts, and fostering a collaborative environment are key to achieving collective goals and maintaining a positive workplace atmosphere",
                                "type": "text",
                                "style": "",
                                "cStyle": null,
                                "detail": 0,
                                "format": 0,
                                "version": 1
                            }
                        ],
                        "direction": null,
                        "textFormat": 1
                    },
                    {
                        "$id": "hY6kKIdU3i",
                        "type": "paragraph",
                        "cStyle": null,
                        "format": "",
                        "indent": 0,
                        "version": 1,
                        "children": [],
                        "direction": null,
                        "textFormat": 0
                    }
                ],
                "direction": "ltr"
            }
        },
        "wordVersion": 1
    },
    "$state": "maximized",
    "$zIndex": 16,
    "$position": [
        0.1602155805977462,
        0.03935185185185185
    ],
    "$minimized": false,
    "$identifier": "mso-word",
    "$localState": {
        "ribbonTab": "shapeFormat",
        "draftTabStops": [],
        "defaultTabStop": 0.5,
        "selectFilePath": "C:/Users/#username/Pictures",
        "pageSetupFormValue": {},
        "splitCellsFormValue": {},
        "insertPictureVisible": false,
        "shareWindowFormValues": {},
        "tabSettingsFormValues": {},
        "borderShadingFormValues": {},
        "insertPageNumberSubmenu": null,
        "lastSerializedSelection": {
            "type": "RangeSelection",
            "focus": {
                "type": "text",
                "offset": 0,
                "indexPath": [
                    1,
                    0,
                    0
                ]
            },
            "anchor": {
                "type": "text",
                "offset": 8,
                "indexPath": [
                    1,
                    0,
                    0
                ]
            }
        },
        "wrapTextContextMenuOpen": null,
        "insertDateTimeFormValues": {},
        "sortTextWindowFormValues": {
            "sortBy": {
                "by": "paragraphs",
                "type": "text",
                "direction": "ascending"
            },
            "hasHeaderRowString": "false"
        },
        "wrapTextOverlayVisibleId": null,
        "numberingWindowFormValues": {},
        "watermarkWindowFormValues": {},
        "horizontalRuleWindowFormValues": {},
        "wordArtButtonOpen": false,
        "fontSelectOpen": false,
        "textColorOpen": true,
        "textEffectsOpen": false,
        "textColorGradientMenu": "gradient"
    }
  }
  const diff = {
    "word": {
        "editorValue": {
            "root": {
                "children": {
                    "1": {
                        "cStyle": {
                            "textFill": {
                                "label": [
                                    "Accent 2 - Linear Down Darker"
                                ],
                                "stops": {
                                    "0": [
                                        {
                                            "color": "$accent-2:darker-5",
                                            "position": 0
                                        }
                                    ],
                                    "1": [
                                        {
                                            "color": "$accent-2:darker-50",
                                            "position": 1
                                        }
                                    ],
                                    "_0": [
                                        {
                                            "color": "#616569",
                                            "position": 0
                                        },
                                        0,
                                        0
                                    ],
                                    "_1": [
                                        {
                                            "color": "#B2B4B7",
                                            "position": 1
                                        },
                                        0,
                                        0
                                    ],
                                    "_t": "a"
                                }
                            }
                        }
                    },
                    "_t": "a"
                }
            }
        }
    },
    "$localState": {
        "textColorOpen": [
            true,
            false
        ]
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const patched = instance.patch(JSON.parse(JSON.stringify(before)), diff as any) as any
  expect(patched.word.editorValue.root.children[1].cStyle).toEqual({
    fontSize: 42,
    textFill: {
      label: 'Accent 2 - Linear Down Darker',
      stops: [
        { color: '$accent-2:darker-5', position: 0 },
        { color: '$accent-2:darker-50', position: 1 },
      ],
    },
  })
})
