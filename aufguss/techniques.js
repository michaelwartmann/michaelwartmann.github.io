// Aufguss Studio – technique database (the "poses"). One entry per technique, numbered for review.
// status: "described" = we know how it is done; "named" = the name is in use, description still to verify.
// family: rotation | eight | sweep | whip | flatspin | throw | wave | pass ; level: 1 beginner, 2 intermediate, 3 advanced
// air / heat / show: 1–3 ; phase: spread | distribute | peak | abschlag ; demo: parameters for the animated figure (demo.js)
window.AUFGUSS_TECHNIQUES = [
  {
    "no": 1,
    "id": "propeller",
    "code": "R1",
    "level": 1,
    "family": "rotation",
    "tool": "towel",
    "hands": 1,
    "towels": 1,
    "air": 2,
    "heat": 2,
    "show": 1,
    "phase": [
      "spread",
      "distribute",
      "peak"
    ],
    "status": "described",
    "name": {
      "en": "Propeller / Helicopter",
      "de": "Propeller / Hubschrauber"
    },
    "aka": [
      "Helicopter",
      "Hubschrauber",
      "Elicottero",
      "Helikopter (NL)",
      "Helikopter (PL)"
    ],
    "desc": {
      "en": "Towel folded double, held by one corner and turned above your head, just under the ceiling. A snap of the wrist adds speed.",
      "de": "Tuch doppelt gefaltet, an einer Ecke gehalten und über dem Kopf direkt unter der Decke gedreht. Ein Schwung aus dem Handgelenk gibt Tempo."
    },
    "use": {
      "en": "Right after pouring: spreads steam and scent from the ceiling down. The first technique to learn.",
      "de": "Direkt nach dem Aufgießen: verteilt Dampf und Duft von der Decke nach unten. Die erste Technik, die man lernt."
    },
    "related": [
      "Nunchaku upper wheel",
      "Color guard parallel plane",
      "Poi",
      "Lasso",
      "Rope flow propeller"
    ],
    "demo": {
      "kind": "recorded",
      "source": "Michael, own clip (two-hand grip), pose tracking",
      "speed": 1.034,
      "data": {
        "sL": [
          [
            0.217,
            1.474,
            -0.01
          ],
          [
            0.227,
            1.475,
            -0.005
          ],
          [
            0.227,
            1.476,
            0.001
          ],
          [
            0.219,
            1.477,
            0.005
          ],
          [
            0.21,
            1.475,
            0.007
          ],
          [
            0.204,
            1.47,
            0.007
          ],
          [
            0.202,
            1.463,
            0.007
          ],
          [
            0.201,
            1.457,
            0.007
          ],
          [
            0.199,
            1.452,
            0.008
          ],
          [
            0.196,
            1.449,
            0.008
          ],
          [
            0.194,
            1.444,
            0.006
          ],
          [
            0.196,
            1.437,
            0.002
          ],
          [
            0.2,
            1.428,
            -0.002
          ],
          [
            0.201,
            1.418,
            -0.005
          ],
          [
            0.2,
            1.411,
            -0.007
          ],
          [
            0.196,
            1.406,
            -0.009
          ],
          [
            0.193,
            1.403,
            -0.01
          ],
          [
            0.19,
            1.402,
            -0.011
          ],
          [
            0.187,
            1.406,
            -0.011
          ],
          [
            0.183,
            1.415,
            -0.011
          ],
          [
            0.178,
            1.431,
            -0.011
          ],
          [
            0.178,
            1.448,
            -0.011
          ],
          [
            0.186,
            1.462,
            -0.012
          ],
          [
            0.201,
            1.471,
            -0.012
          ]
        ],
        "sR": [
          [
            -0.184,
            1.463,
            -0.027
          ],
          [
            -0.176,
            1.461,
            -0.024
          ],
          [
            -0.175,
            1.456,
            -0.019
          ],
          [
            -0.18,
            1.45,
            -0.013
          ],
          [
            -0.188,
            1.446,
            -0.007
          ],
          [
            -0.195,
            1.444,
            0.001
          ],
          [
            -0.198,
            1.444,
            0.012
          ],
          [
            -0.2,
            1.446,
            0.024
          ],
          [
            -0.203,
            1.448,
            0.034
          ],
          [
            -0.206,
            1.451,
            0.039
          ],
          [
            -0.209,
            1.455,
            0.038
          ],
          [
            -0.211,
            1.459,
            0.033
          ],
          [
            -0.21,
            1.462,
            0.028
          ],
          [
            -0.21,
            1.463,
            0.024
          ],
          [
            -0.211,
            1.462,
            0.021
          ],
          [
            -0.211,
            1.461,
            0.018
          ],
          [
            -0.209,
            1.459,
            0.012
          ],
          [
            -0.205,
            1.458,
            0.003
          ],
          [
            -0.201,
            1.458,
            -0.007
          ],
          [
            -0.199,
            1.459,
            -0.016
          ],
          [
            -0.201,
            1.459,
            -0.022
          ],
          [
            -0.203,
            1.46,
            -0.026
          ],
          [
            -0.202,
            1.461,
            -0.028
          ],
          [
            -0.195,
            1.463,
            -0.028
          ]
        ],
        "eL": [
          [
            0.235,
            1.766,
            -0.014
          ],
          [
            0.233,
            1.81,
            -0.005
          ],
          [
            0.226,
            1.842,
            0.008
          ],
          [
            0.218,
            1.848,
            0.022
          ],
          [
            0.213,
            1.833,
            0.037
          ],
          [
            0.211,
            1.812,
            0.051
          ],
          [
            0.21,
            1.799,
            0.061
          ],
          [
            0.214,
            1.796,
            0.066
          ],
          [
            0.225,
            1.796,
            0.066
          ],
          [
            0.244,
            1.788,
            0.063
          ],
          [
            0.266,
            1.773,
            0.058
          ],
          [
            0.287,
            1.758,
            0.052
          ],
          [
            0.299,
            1.745,
            0.046
          ],
          [
            0.303,
            1.731,
            0.04
          ],
          [
            0.298,
            1.708,
            0.034
          ],
          [
            0.284,
            1.676,
            0.026
          ],
          [
            0.261,
            1.646,
            0.018
          ],
          [
            0.23,
            1.633,
            0.009
          ],
          [
            0.198,
            1.642,
            0.001
          ],
          [
            0.173,
            1.665,
            -0.007
          ],
          [
            0.167,
            1.688,
            -0.013
          ],
          [
            0.18,
            1.7,
            -0.018
          ],
          [
            0.203,
            1.709,
            -0.02
          ],
          [
            0.224,
            1.729,
            -0.019
          ]
        ],
        "eR": [
          [
            -0.358,
            1.77,
            -0.04
          ],
          [
            -0.353,
            1.764,
            -0.037
          ],
          [
            -0.35,
            1.757,
            -0.03
          ],
          [
            -0.341,
            1.747,
            -0.015
          ],
          [
            -0.324,
            1.735,
            0.008
          ],
          [
            -0.298,
            1.726,
            0.036
          ],
          [
            -0.269,
            1.722,
            0.064
          ],
          [
            -0.245,
            1.726,
            0.084
          ],
          [
            -0.231,
            1.738,
            0.096
          ],
          [
            -0.223,
            1.756,
            0.097
          ],
          [
            -0.219,
            1.776,
            0.092
          ],
          [
            -0.214,
            1.793,
            0.084
          ],
          [
            -0.212,
            1.803,
            0.077
          ],
          [
            -0.213,
            1.806,
            0.072
          ],
          [
            -0.217,
            1.805,
            0.066
          ],
          [
            -0.223,
            1.802,
            0.057
          ],
          [
            -0.23,
            1.798,
            0.043
          ],
          [
            -0.242,
            1.795,
            0.024
          ],
          [
            -0.262,
            1.792,
            0.003
          ],
          [
            -0.291,
            1.79,
            -0.017
          ],
          [
            -0.323,
            1.787,
            -0.032
          ],
          [
            -0.348,
            1.783,
            -0.039
          ],
          [
            -0.362,
            1.779,
            -0.042
          ],
          [
            -0.363,
            1.775,
            -0.041
          ]
        ],
        "wL": [
          [
            0.033,
            1.802,
            -0.104
          ],
          [
            -0.009,
            1.837,
            -0.094
          ],
          [
            -0.051,
            1.87,
            -0.077
          ],
          [
            -0.078,
            1.903,
            -0.048
          ],
          [
            -0.088,
            1.945,
            -0.006
          ],
          [
            -0.085,
            2.0,
            0.039
          ],
          [
            -0.073,
            2.059,
            0.074
          ],
          [
            -0.049,
            2.108,
            0.092
          ],
          [
            -0.004,
            2.138,
            0.095
          ],
          [
            0.06,
            2.153,
            0.09
          ],
          [
            0.129,
            2.159,
            0.084
          ],
          [
            0.179,
            2.162,
            0.079
          ],
          [
            0.198,
            2.156,
            0.073
          ],
          [
            0.195,
            2.134,
            0.061
          ],
          [
            0.186,
            2.094,
            0.046
          ],
          [
            0.182,
            2.041,
            0.028
          ],
          [
            0.177,
            1.99,
            0.007
          ],
          [
            0.16,
            1.946,
            -0.017
          ],
          [
            0.124,
            1.907,
            -0.047
          ],
          [
            0.08,
            1.865,
            -0.078
          ],
          [
            0.05,
            1.819,
            -0.104
          ],
          [
            0.044,
            1.781,
            -0.118
          ],
          [
            0.051,
            1.764,
            -0.119
          ],
          [
            0.053,
            1.773,
            -0.113
          ]
        ],
        "wR": [
          [
            -0.073,
            1.888,
            -0.15
          ],
          [
            -0.086,
            1.899,
            -0.145
          ],
          [
            -0.108,
            1.904,
            -0.13
          ],
          [
            -0.134,
            1.914,
            -0.099
          ],
          [
            -0.16,
            1.941,
            -0.05
          ],
          [
            -0.175,
            1.993,
            0.009
          ],
          [
            -0.17,
            2.059,
            0.06
          ],
          [
            -0.148,
            2.118,
            0.091
          ],
          [
            -0.109,
            2.156,
            0.101
          ],
          [
            -0.06,
            2.172,
            0.094
          ],
          [
            -0.01,
            2.175,
            0.082
          ],
          [
            0.033,
            2.172,
            0.07
          ],
          [
            0.062,
            2.163,
            0.06
          ],
          [
            0.079,
            2.141,
            0.049
          ],
          [
            0.087,
            2.103,
            0.035
          ],
          [
            0.093,
            2.05,
            0.015
          ],
          [
            0.099,
            1.997,
            -0.012
          ],
          [
            0.1,
            1.951,
            -0.045
          ],
          [
            0.089,
            1.915,
            -0.082
          ],
          [
            0.063,
            1.885,
            -0.117
          ],
          [
            0.024,
            1.863,
            -0.144
          ],
          [
            -0.015,
            1.851,
            -0.157
          ],
          [
            -0.045,
            1.853,
            -0.158
          ],
          [
            -0.063,
            1.868,
            -0.154
          ]
        ],
        "hL": [
          [
            0.126,
            0.569,
            0.018
          ],
          [
            0.141,
            0.568,
            0.019
          ],
          [
            0.148,
            0.565,
            0.019
          ],
          [
            0.149,
            0.56,
            0.02
          ],
          [
            0.148,
            0.557,
            0.019
          ],
          [
            0.148,
            0.555,
            0.018
          ],
          [
            0.149,
            0.553,
            0.015
          ],
          [
            0.15,
            0.551,
            0.012
          ],
          [
            0.148,
            0.549,
            0.01
          ],
          [
            0.143,
            0.548,
            0.008
          ],
          [
            0.137,
            0.548,
            0.007
          ],
          [
            0.132,
            0.549,
            0.007
          ],
          [
            0.129,
            0.55,
            0.007
          ],
          [
            0.124,
            0.549,
            0.007
          ],
          [
            0.119,
            0.546,
            0.007
          ],
          [
            0.113,
            0.544,
            0.007
          ],
          [
            0.11,
            0.543,
            0.009
          ],
          [
            0.108,
            0.543,
            0.011
          ],
          [
            0.107,
            0.544,
            0.013
          ],
          [
            0.103,
            0.546,
            0.015
          ],
          [
            0.097,
            0.549,
            0.016
          ],
          [
            0.093,
            0.553,
            0.016
          ],
          [
            0.097,
            0.559,
            0.016
          ],
          [
            0.109,
            0.565,
            0.017
          ]
        ],
        "hR": [
          [
            -0.157,
            0.581,
            -0.007
          ],
          [
            -0.143,
            0.58,
            -0.007
          ],
          [
            -0.136,
            0.576,
            -0.008
          ],
          [
            -0.134,
            0.573,
            -0.009
          ],
          [
            -0.136,
            0.569,
            -0.008
          ],
          [
            -0.136,
            0.567,
            -0.007
          ],
          [
            -0.135,
            0.565,
            -0.004
          ],
          [
            -0.134,
            0.563,
            -0.001
          ],
          [
            -0.136,
            0.561,
            0.002
          ],
          [
            -0.142,
            0.559,
            0.004
          ],
          [
            -0.148,
            0.559,
            0.005
          ],
          [
            -0.153,
            0.56,
            0.005
          ],
          [
            -0.157,
            0.561,
            0.005
          ],
          [
            -0.162,
            0.561,
            0.005
          ],
          [
            -0.168,
            0.56,
            0.005
          ],
          [
            -0.173,
            0.559,
            0.004
          ],
          [
            -0.175,
            0.559,
            0.002
          ],
          [
            -0.175,
            0.561,
            0.0
          ],
          [
            -0.175,
            0.563,
            -0.002
          ],
          [
            -0.177,
            0.565,
            -0.004
          ],
          [
            -0.183,
            0.568,
            -0.005
          ],
          [
            -0.186,
            0.571,
            -0.005
          ],
          [
            -0.183,
            0.575,
            -0.005
          ],
          [
            -0.172,
            0.579,
            -0.006
          ]
        ]
      }
    },
    "videos": [
      {
        "url": "https://www.youtube.com/watch?v=YETT86EXfyA",
        "title": "Aufguss.it – Helicopter (Helikopter)"
      },
      {
        "url": "https://www.youtube.com/watch?v=L1gMSjO0PmQ",
        "title": "Aufguss Towel Waving Basics"
      }
    ]
  },
  {
    "no": 2,
    "id": "flag",
    "code": "F1",
    "level": 1,
    "family": "sweep",
    "tool": "towel",
    "hands": 2,
    "towels": 1,
    "air": 3,
    "heat": 2,
    "show": 1,
    "phase": [
      "distribute",
      "peak"
    ],
    "status": "described",
    "name": {
      "en": "Side flag",
      "de": "Seitliche Fahne"
    },
    "aka": [
      "Flag",
      "Fahne",
      "Bandiera laterale",
      "Zijslag? (NL, to verify)",
      "Flaga (PL)"
    ],
    "desc": {
      "en": "Open towel held almost upright, one hand at the top, one at the bottom, swept left and right. Keep it flowing, or swap hands at each end. Tutorial variants: Single Flag (right or left hand up, the other hand low on the same long edge) and Double Flag (both hands above the head). Easy to learn, moves a lot of air.",
      "de": "Offenes Tuch fast senkrecht, eine Hand oben, eine unten, nach links und rechts geschwenkt. Fließend halten oder an jedem Ende die Hände tauschen. Varianten im Tutorial: Single Flag (rechte oder linke Hand oben, die andere unten an derselben langen Kante) und Double Flag (beide Hände über dem Kopf). Leicht zu lernen, bewegt viel Luft."
    },
    "use": {
      "en": "One of the most efficient ways to push air towards the guests.",
      "de": "Eine der wirksamsten Bewegungen, um Luft zu den Gästen zu schieben."
    },
    "related": [
      "Color guard flag",
      "Sbandieratori",
      "Fan dance"
    ],
    "demo": {
      "kind": "sweep",
      "speed": 0.9
    },
    "videos": [
      {
        "url": "https://www.youtube.com/watch?v=8v8GQ9QxDtM",
        "title": "Aufguss.it 2 – Flag (Zijslag)"
      }
    ],
    "clip": {
      "id": "8v8GQ9QxDtM",
      "start": 48,
      "end": 54,
      "credit": "Aufguss.it",
      "check": true
    }
  },
  {
    "no": 3,
    "id": "shovel",
    "code": "F2",
    "level": 1,
    "family": "sweep",
    "tool": "towel",
    "hands": 2,
    "towels": 1,
    "air": 3,
    "heat": 3,
    "show": 1,
    "phase": [
      "distribute",
      "peak"
    ],
    "status": "described",
    "name": {
      "en": "Parachute / Shovel",
      "de": "Fallschirm / Schaufel"
    },
    "aka": [
      "Parachute",
      "Schaufel",
      "Pala",
      "Spadochron (PL)",
      "Bovenklap? (NL, to verify)"
    ],
    "desc": {
      "en": "Towel spread above the head like a parachute, both hands on the top corners. Bring it down in one wide movement in front of you to your feet, then back up along the side to the top. The whole column of air from ceiling to floor moves (tutorial: difficulty +, air +++).",
      "de": "Tuch über dem Kopf ausgebreitet wie ein Fallschirm, beide Hände an den oberen Ecken. In einer weiten Bewegung vor dir bis zu den Füßen bringen, dann seitlich wieder nach oben. Die ganze Luftsäule von der Decke bis zum Boden bewegt sich (Tutorial: Schwierigkeit +, Luft +++)."
    },
    "use": {
      "en": "Moves the largest volume of air, from top to bottom.",
      "de": "Bewegt die größte Luftmenge, von oben nach unten."
    },
    "related": [
      "Volleyball overhead pass",
      "Rowing stroke"
    ],
    "demo": {
      "kind": "keys",
      "grip": "spread",
      "speed": 0.8,
      "cloth": [
        0.85,
        0.6
      ],
      "source": "Aufguss.it 4 Parachute, watched and keyframed by hand",
      "keys": [
        [
          0.0,
          [
            0.3,
            2.0,
            0.05
          ],
          [
            -0.3,
            2.0,
            0.05
          ]
        ],
        [
          0.22,
          [
            0.28,
            1.5,
            0.5
          ],
          [
            -0.28,
            1.5,
            0.5
          ]
        ],
        [
          0.4,
          [
            0.22,
            0.92,
            0.42
          ],
          [
            -0.22,
            0.92,
            0.42
          ]
        ],
        [
          0.6,
          [
            0.45,
            1.1,
            0.2
          ],
          [
            0.0,
            1.05,
            0.25
          ]
        ],
        [
          0.8,
          [
            0.4,
            1.72,
            0.0
          ],
          [
            -0.05,
            1.78,
            0.05
          ]
        ]
      ]
    },
    "videos": [
      {
        "url": "https://www.youtube.com/watch?v=uqz_wpzrpvA",
        "title": "Aufguss.it – Bovenklap (via Dutch sauna master association)"
      }
    ],
    "clip": {
      "id": "uqz_wpzrpvA",
      "start": 37.8,
      "end": 40.9,
      "credit": "Aufguss.it",
      "check": true
    }
  },
  {
    "no": 4,
    "id": "comb",
    "code": "F3",
    "level": 1,
    "family": "sweep",
    "tool": "towel",
    "hands": 2,
    "towels": 1,
    "air": 2,
    "heat": 1,
    "show": 1,
    "phase": [
      "distribute"
    ],
    "status": "described",
    "name": {
      "en": "Comb",
      "de": "Kamm"
    },
    "aka": [
      "Pettine"
    ],
    "desc": {
      "en": "Both hands on the top corners. Gather the towel at the chest, then snap the hands apart so it bursts open and throws a puff of air: low in front for the bottom benches, flung up over the head for the top benches. Variant: swing it beside you.",
      "de": "Beide Hände an den oberen Ecken. Das Tuch vor der Brust sammeln, dann die Hände schnell auseinanderziehen, sodass es aufplatzt und einen Luftstoß wirft: tief vorne für die unteren Bänke, über den Kopf geschleudert für die oberen. Variante: neben dir schwingen."
    },
    "use": {
      "en": "Evens out the temperature. Not at the start of a round: it can't carry the rising scented steam.",
      "de": "Gleicht die Temperatur aus. Nicht am Anfang einer Runde: Er trägt den aufsteigenden Duftdampf nicht."
    },
    "related": [
      "Reverse parachute"
    ],
    "demo": {
      "kind": "comb",
      "speed": 0.9
    },
    "videos": [
      {
        "url": "https://www.youtube.com/watch?v=pzGbE27Oh9s",
        "title": "Aufguss.it 3 – Comb"
      }
    ],
    "clip": {
      "id": "pzGbE27Oh9s",
      "start": 30.8,
      "end": 32.8,
      "credit": "Aufguss.it",
      "check": true
    }
  },
  {
    "no": 5,
    "id": "eight",
    "code": "X1",
    "level": 1,
    "family": "eight",
    "tool": "towel",
    "hands": 1,
    "towels": 1,
    "air": 2,
    "heat": 2,
    "show": 1,
    "phase": [
      "distribute",
      "peak"
    ],
    "status": "described",
    "name": {
      "en": "Figure eight",
      "de": "Acht"
    },
    "aka": [
      "Achter",
      "Otto",
      "Tecnica a 8",
      "Ósemka (PL)"
    ],
    "desc": {
      "en": "The towel draws a lying 8 in front of you, crossing in the middle. A classic expected at championships.",
      "de": "Das Tuch zeichnet eine liegende 8 vor dem Körper und kreuzt in der Mitte. Ein Klassiker, der auch bei Meisterschaften erwartet wird."
    },
    "use": {
      "en": "Even distribution towards both sides of the room.",
      "de": "Gleichmäßige Verteilung zu beiden Seiten des Raums."
    },
    "related": [
      "Nunchaku figure eight",
      "Poi weave",
      "Ribbon figure eight"
    ],
    "demo": {
      "kind": "eight",
      "speed": 1
    },
    "videos": [
      {
        "url": "https://www.youtube.com/watch?v=aH5VBpaSJsk",
        "title": "Achter-Technik einfach erklärt"
      }
    ]
  },
  {
    "no": 6,
    "id": "circles",
    "code": "R2",
    "level": 1,
    "family": "rotation",
    "tool": "towel",
    "hands": 1,
    "towels": 1,
    "air": 2,
    "heat": 2,
    "show": 1,
    "phase": [
      "distribute"
    ],
    "status": "described",
    "name": {
      "en": "Circles",
      "de": "Kreise"
    },
    "aka": [
      "Windmill",
      "Windmühle"
    ],
    "desc": {
      "en": "The towel turns in a circle beside or in front of the body, like a wheel.",
      "de": "Das Tuch dreht sich wie ein Rad neben oder vor dem Körper im Kreis."
    },
    "use": {
      "en": "Simple distribution, easy to keep up for a long time.",
      "de": "Einfache Verteilung, lange durchzuhalten."
    },
    "related": [
      "Nunchaku wheel",
      "Poi wall plane",
      "Arm circles"
    ],
    "demo": {
      "kind": "rotate",
      "plane": "wall",
      "speed": 1.2
    }
  },
  {
    "no": 7,
    "id": "sail",
    "code": "F4",
    "level": 1,
    "family": "sweep",
    "tool": "towel",
    "hands": 2,
    "towels": 1,
    "air": 1,
    "heat": 1,
    "show": 1,
    "phase": [
      "distribute"
    ],
    "status": "described",
    "name": {
      "en": "Sail",
      "de": "Segel"
    },
    "aka": [],
    "desc": {
      "en": "A gentle, slow sweep with the open towel. Softer than the flag.",
      "de": "Ein sanfter, langsamer Schwung mit offenem Tuch. Weicher als die Fahne."
    },
    "use": {
      "en": "Small saunas and gentle rounds.",
      "de": "Kleine Saunen und sanfte Runden."
    },
    "related": [
      "Sailing",
      "Tai chi cloud hands"
    ],
    "demo": {
      "kind": "sweep",
      "speed": 0.5
    }
  },
  {
    "no": 8,
    "id": "abschlagen",
    "code": "S1",
    "level": 1,
    "family": "whip",
    "tool": "towel",
    "hands": 1,
    "towels": 1,
    "air": 1,
    "heat": 3,
    "show": 1,
    "phase": [
      "abschlag"
    ],
    "status": "described",
    "name": {
      "en": "Abschlagen (heat strike)",
      "de": "Abschlagen"
    },
    "aka": [
      "Strike",
      "Abschlag"
    ],
    "desc": {
      "en": "Lift the towel and snap it sharply downwards towards one guest or one row. The wave runs from your hand to the end of the towel.",
      "de": "Tuch anheben und kräftig nach unten zu einem Gast oder einer Reihe schlagen. Die Welle läuft von der Hand bis ans Tuchende."
    },
    "use": {
      "en": "Short after a round so everyone feels the heat; the real one at the very end.",
      "de": "Kurz nach einer Runde, damit jeder die Hitze spürt; das richtige Abschlagen ganz am Schluss."
    },
    "related": [
      "Tennis serve",
      "Volleyball spike",
      "Whip crack"
    ],
    "demo": {
      "kind": "whip",
      "speed": 0.9
    }
  },
  {
    "no": 9,
    "id": "fan",
    "code": "F1·Fan",
    "level": 1,
    "family": "sweep",
    "tool": "fan",
    "hands": 1,
    "towels": 0,
    "air": 1,
    "heat": 2,
    "show": 1,
    "phase": [
      "distribute",
      "abschlag"
    ],
    "status": "described",
    "name": {
      "en": "Sauna fan",
      "de": "Fächer"
    },
    "aka": [
      "Fächeraufguss"
    ],
    "desc": {
      "en": "A sauna fan instead of the towel, waved towards the guests.",
      "de": "Ein Saunafächer statt des Tuchs, zu den Gästen gewedelt."
    },
    "use": {
      "en": "Home saunas, small rooms, easy start, aimed heat for each guest.",
      "de": "Heimsauna, kleine Räume, leichter Einstieg, gezielte Hitze für jeden Gast."
    },
    "related": [
      "Fan dance"
    ],
    "demo": {
      "kind": "fan",
      "speed": 1.2
    }
  },
  {
    "no": 10,
    "id": "x-swing",
    "code": "X2",
    "level": 1,
    "family": "eight",
    "tool": "towel",
    "hands": 1,
    "towels": 1,
    "air": 2,
    "heat": 2,
    "show": 1,
    "phase": [
      "distribute",
      "peak"
    ],
    "status": "described",
    "name": {
      "en": "X swing",
      "de": "X-Schwung"
    },
    "aka": [
      "X"
    ],
    "desc": {
      "en": "The towel swings in an X across the body. With the helicopter, one of the two standard moves that are all you really need.",
      "de": "Das Tuch schwingt in einem X über den Körper. Mit dem Hubschrauber eine der zwei Grundbewegungen, die eigentlich reichen."
    },
    "use": {
      "en": "Everyday waving, easy to learn in a short time with a little guidance.",
      "de": "Alltägliches Wedeln, mit etwas Anleitung schnell gelernt."
    },
    "related": [
      "Nunchaku figure eight",
      "Tennis forehand/backhand"
    ],
    "demo": {
      "kind": "eight",
      "speed": 0.9,
      "x": true
    }
  },
  {
    "no": 11,
    "id": "holzfaeller",
    "code": "S2",
    "level": 1,
    "family": "whip",
    "tool": "towel",
    "hands": 2,
    "towels": 1,
    "air": 3,
    "heat": 2,
    "show": 1,
    "phase": [
      "distribute"
    ],
    "status": "described",
    "name": {
      "en": "Lumberjack",
      "de": "Holzfäller"
    },
    "aka": [
      "Lumberjack",
      "Spaccalegna"
    ],
    "desc": {
      "en": "Open towel held by both top corners in front at the hips. Swing it up past the face and over the head until the hands are behind the neck and the towel hangs down the back, then up again and chop it down to the front like an axe. Keep it off your body. Moves a lot of air (tutorial: difficulty +, air ++++).",
      "de": "Offenes Tuch an beiden oberen Ecken vor der Hüfte halten. Am Gesicht vorbei über den Kopf schwingen, bis die Hände hinter dem Nacken sind und das Tuch den Rücken hinunterhängt, dann wieder hoch und wie eine Axt nach vorne unten schlagen. Das Tuch berührt den Körper nicht. Bewegt sehr viel Luft (Tutorial: Schwierigkeit +, Luft ++++)."
    },
    "use": {
      "en": "Pushes heat down towards the guests; simple and strong.",
      "de": "Drückt die Hitze nach unten zu den Gästen; einfach und kräftig."
    },
    "related": [
      "Wood chopping"
    ],
    "demo": {
      "kind": "keys",
      "grip": "spread",
      "speed": 0.5,
      "source": "Aufguss.it 22 Lumberjack, watched and keyframed by hand",
      "keys": [
        [
          0,
          [
            0.25,
            1.0,
            0.35
          ],
          [
            -0.25,
            1.0,
            0.35
          ]
        ],
        [
          0.18,
          [
            0.25,
            1.5,
            0.3
          ],
          [
            -0.25,
            1.5,
            0.3
          ]
        ],
        [
          0.32,
          [
            0.22,
            1.98,
            0.02
          ],
          [
            -0.22,
            1.98,
            0.02
          ]
        ],
        [
          0.46,
          [
            0.2,
            1.72,
            -0.2
          ],
          [
            -0.2,
            1.72,
            -0.2
          ]
        ],
        [
          0.56,
          [
            0.22,
            1.98,
            0.02
          ],
          [
            -0.22,
            1.98,
            0.02
          ]
        ],
        [
          0.72,
          [
            0.25,
            1.4,
            0.55
          ],
          [
            -0.25,
            1.4,
            0.55
          ]
        ],
        [
          0.84,
          [
            0.25,
            1.02,
            0.45
          ],
          [
            -0.25,
            1.02,
            0.45
          ]
        ]
      ]
    },
    "videos": [
      {
        "url": "https://www.youtube.com/watch?v=6dSv-wg8PXs",
        "title": "Aufguss.it 22 – Lumberjack"
      }
    ],
    "clip": {
      "id": "6dSv-wg8PXs",
      "start": 38.4,
      "end": 40.8,
      "credit": "Aufguss.it",
      "check": true
    }
  },
  {
    "no": 12,
    "id": "windmill",
    "code": "R?",
    "level": 1,
    "family": "rotation",
    "tool": "towel",
    "hands": 1,
    "towels": 1,
    "air": 2,
    "heat": 2,
    "show": 1,
    "phase": [
      "distribute"
    ],
    "status": "named",
    "name": {
      "en": "Windmill",
      "de": "Windmühle"
    },
    "aka": [],
    "desc": {
      "en": "Classic technique (teaching video series no. 1). Likely large wheel circles. (Details to verify.)",
      "de": "Klassische Technik (Lernvideo-Reihe Nr. 1). Vermutlich große Radkreise. (Details noch prüfen.)"
    },
    "use": {
      "en": "Classic distribution.",
      "de": "Klassische Verteilung."
    },
    "related": [
      "Arm circles",
      "Poi windmill"
    ],
    "demo": {
      "kind": "rotate",
      "plane": "wall",
      "speed": 1,
      "big": true
    },
    "videos": [
      {
        "url": "https://www.youtube.com/watch?v=f-mNQ6mTVl8",
        "title": "Classic-Aufgüsse Lernvideo Nr. 1 – Windmühle"
      }
    ]
  },
  {
    "no": 13,
    "id": "delphin",
    "code": "W?",
    "level": 1,
    "family": "wave",
    "tool": "towel",
    "hands": 2,
    "towels": 1,
    "air": 2,
    "heat": 2,
    "show": 1,
    "phase": [
      "distribute"
    ],
    "status": "named",
    "name": {
      "en": "Dolphin",
      "de": "Delphin"
    },
    "aka": [],
    "desc": {
      "en": "Classic technique (teaching video series no. 4). (Description to verify.)",
      "de": "Klassische Technik (Lernvideo-Reihe Nr. 4). (Beschreibung noch prüfen.)"
    },
    "use": {
      "en": "To verify.",
      "de": "Noch prüfen."
    },
    "related": [],
    "demo": {
      "kind": "wave",
      "speed": 0.8
    },
    "videos": [
      {
        "url": "https://www.youtube.com/watch?v=6SD0Dz3Vm2c",
        "title": "Classic-Aufgüsse Lernvideo Nr. 4 – Delphin"
      }
    ]
  },
  {
    "no": 14,
    "id": "spoon",
    "code": "F1+F2",
    "tool": "towel",
    "hands": 2,
    "towels": 1,
    "air": 3,
    "heat": 2,
    "show": 1,
    "phase": [
      "distribute",
      "peak"
    ],
    "status": "named",
    "related": [],
    "aka": [
      "Cucchiaio"
    ],
    "videos": [],
    "level": 1,
    "family": "sweep",
    "name": {
      "en": "Spoon",
      "de": "Löffel"
    },
    "desc": {
      "en": "Alternating shovel and flag to reach guests far away. (Some English sources use “spoon” for one of the classic four; to verify.)",
      "de": "Schaufel und Fahne im Wechsel, um auch weit entfernte Gäste zu erreichen. (Manche englische Quellen nennen eine der klassischen vier „Spoon“; noch prüfen.)"
    },
    "use": {
      "en": "Large saunas, far benches.",
      "de": "Große Saunen, entfernte Bänke."
    },
    "demo": {
      "kind": "shovel",
      "speed": 0.8
    }
  },
  {
    "no": 15,
    "id": "double-eight",
    "code": "X3",
    "level": 2,
    "family": "eight",
    "tool": "towel",
    "hands": 1,
    "towels": 1,
    "air": 2,
    "heat": 2,
    "show": 2,
    "phase": [
      "distribute"
    ],
    "status": "described",
    "name": {
      "en": "Double eight",
      "de": "Doppelacht"
    },
    "aka": [
      "Doppel 8"
    ],
    "desc": {
      "en": "Two figure eights in a row, one high and one low, or one in front and one beside you.",
      "de": "Zwei Achten hintereinander, eine hoch und eine tief, oder eine vor und eine neben dem Körper."
    },
    "use": {
      "en": "More coverage of the room than a single eight.",
      "de": "Deckt mehr vom Raum ab als eine einfache Acht."
    },
    "related": [
      "Nunchaku continuous figure eights",
      "Poi"
    ],
    "demo": {
      "kind": "eight",
      "speed": 1.1,
      "double": true
    }
  },
  {
    "no": 16,
    "id": "pizza",
    "code": "P1",
    "level": 2,
    "family": "flatspin",
    "tool": "towel",
    "hands": 1,
    "towels": 1,
    "air": 2,
    "heat": 1,
    "show": 2,
    "phase": [
      "distribute"
    ],
    "status": "named",
    "name": {
      "en": "Pizza",
      "de": "Pizza"
    },
    "aka": [
      "Pizza verticale (vertical, sunflower) = figure eight variant"
    ],
    "desc": {
      "en": "The open towel spins flat like pizza dough being twirled; the spin keeps it open. A vertical version (“sunflower”) draws an 8; it only sends air if the arm also moves forward.",
      "de": "Das offene Tuch dreht sich flach wie ein geschwungener Pizzateig; die Drehung hält es offen. Eine senkrechte Variante („Sonnenblume“) zeichnet eine 8; sie schickt nur Luft, wenn der Arm dabei nach vorn geht."
    },
    "use": {
      "en": "A trendy second-tier move: added effect and style.",
      "de": "Beliebte Technik der zweiten Stufe: mehr Wirkung und Stil."
    },
    "related": [
      "Pizza dough tossing",
      "Spinning skirt",
      "Plate spinning"
    ],
    "demo": {
      "kind": "flatspin",
      "speed": 1.6
    }
  },
  {
    "no": 17,
    "id": "helicopter-variants",
    "code": "R3",
    "level": 2,
    "family": "rotation",
    "tool": "towel",
    "hands": 1,
    "towels": 1,
    "air": 2,
    "heat": 2,
    "show": 2,
    "phase": [
      "distribute"
    ],
    "status": "described",
    "name": {
      "en": "Helicopter variants",
      "de": "Hubschrauber-Varianten"
    },
    "aka": [],
    "desc": {
      "en": "Variations on the helicopter that add show elements without being excessive: changing height, tilt, hand and direction.",
      "de": "Varianten des Hubschraubers, die Show-Elemente hinzufügen, ohne zu übertreiben: wechselnde Höhe, Neigung, Hand und Richtung."
    },
    "use": {
      "en": "More show while keeping the steam moving.",
      "de": "Mehr Show, während der Dampf in Bewegung bleibt."
    },
    "related": [
      "Color guard 45° plane",
      "Poi planes"
    ],
    "demo": {
      "kind": "rotate",
      "plane": "tilted",
      "speed": 1.4
    },
    "videos": [
      {
        "url": "https://www.youtube.com/watch?v=VvHrrlI4CEo",
        "title": "Aufguss.it 5 – The Helicopter: variations"
      }
    ]
  },
  {
    "no": 18,
    "id": "flag-variants",
    "code": "F6",
    "level": 2,
    "family": "sweep",
    "tool": "towel",
    "hands": 2,
    "towels": 1,
    "air": 3,
    "heat": 2,
    "show": 2,
    "phase": [
      "distribute"
    ],
    "status": "named",
    "name": {
      "en": "Flag variants",
      "de": "Fahnen-Varianten"
    },
    "aka": [],
    "desc": {
      "en": "The side flag with turns, hand changes and height changes. Not for classic or meditative infusions.",
      "de": "Die seitliche Fahne mit Drehungen, Handwechseln und Höhenwechseln. Nicht für klassische oder meditative Aufgüsse."
    },
    "use": {
      "en": "Show element with strong air movement.",
      "de": "Show-Element mit kräftiger Luftbewegung."
    },
    "related": [
      "Color guard drop spin",
      "Sbandieratori"
    ],
    "demo": {
      "kind": "sweep",
      "speed": 1.1
    },
    "clip": {
      "id": "8v8GQ9QxDtM",
      "start": 34,
      "end": 40,
      "credit": "Aufguss.it",
      "check": true
    },
    "videos": [
      {
        "url": "https://www.youtube.com/watch?v=8v8GQ9QxDtM",
        "title": "Aufguss.it 2 – Flag (Double Flag)"
      }
    ]
  },
  {
    "no": 19,
    "id": "unfolding",
    "code": "W1",
    "level": 2,
    "family": "wave",
    "tool": "towel",
    "hands": 2,
    "towels": 1,
    "air": 2,
    "heat": 1,
    "show": 2,
    "phase": [
      "distribute"
    ],
    "status": "described",
    "name": {
      "en": "Unfolding",
      "de": "Entfaltung"
    },
    "aka": [],
    "desc": {
      "en": "Hold two adjacent corners, hands about shoulder-width apart. Circle the towel up the side, let it spread flat above your head like a parachute, then pull it down the side so it unfolds into a full sheet. Keep it flowing without a pause (tutorial: difficulty ++, air ++).",
      "de": "Zwei benachbarte Ecken halten, Hände etwa schulterbreit. Das Tuch seitlich nach oben kreisen, über dem Kopf flach wie einen Fallschirm aufgehen lassen, dann an der Seite nach unten ziehen, sodass es sich ganz entfaltet. Ohne Pause fließen lassen (Tutorial: Schwierigkeit ++, Luft ++)."
    },
    "use": {
      "en": "Mainly show and highlight infusions.",
      "de": "Vor allem Show- und Highlight-Aufgüsse."
    },
    "related": [
      "Chinese water sleeves",
      "Ribbon snakes"
    ],
    "demo": {
      "kind": "keys",
      "grip": "spread",
      "speed": 0.75,
      "source": "Aufguss.it 7 Unfolding, watched and keyframed by hand",
      "keys": [
        [
          0.0,
          [
            0.05,
            1.1,
            0.4
          ],
          [
            -0.45,
            1.08,
            0.35
          ]
        ],
        [
          0.14,
          [
            0.2,
            1.55,
            0.32
          ],
          [
            -0.25,
            1.65,
            0.25
          ]
        ],
        [
          0.3,
          [
            0.27,
            2.0,
            -0.05
          ],
          [
            -0.22,
            2.0,
            -0.08
          ]
        ],
        [
          0.48,
          [
            0.22,
            1.95,
            0.1
          ],
          [
            -0.25,
            1.9,
            0.08
          ]
        ],
        [
          0.66,
          [
            0.0,
            1.6,
            0.3
          ],
          [
            -0.45,
            1.35,
            0.25
          ]
        ],
        [
          0.84,
          [
            -0.02,
            1.2,
            0.4
          ],
          [
            -0.5,
            1.1,
            0.32
          ]
        ]
      ],
      "cloth": [
        0.95,
        0.75
      ]
    },
    "videos": [
      {
        "url": "https://www.youtube.com/watch?v=r2BRLXQRSu4",
        "title": "Aufguss.it 7 – Unfolding"
      }
    ],
    "clip": {
      "id": "r2BRLXQRSu4",
      "start": 44.0,
      "end": 46.6,
      "credit": "Aufguss.it",
      "check": true
    }
  },
  {
    "no": 20,
    "id": "slap",
    "code": "S3",
    "level": 2,
    "family": "whip",
    "tool": "towel",
    "hands": 1,
    "towels": 1,
    "air": 1,
    "heat": 3,
    "show": 2,
    "phase": [
      "abschlag",
      "distribute"
    ],
    "status": "named",
    "name": {
      "en": "Slap",
      "de": "Slap"
    },
    "aka": [
      "Schiaffo"
    ],
    "desc": {
      "en": "Hold the towel like the oblique flag, hands apart on the same edge. Lift it over the head and slap it down across the front, so it cracks flat towards the guests; let it swing back and repeat (about one slap per second).",
      "de": "Das Tuch wie bei der schrägen Fahne halten, die Hände auseinander an derselben Kante. Über den Kopf heben und vorne quer nach unten schlagen, sodass es flach zu den Gästen knallt; zurückschwingen lassen und wiederholen (etwa ein Schlag pro Sekunde)."
    },
    "use": {
      "en": "Accents and heat pushes.",
      "de": "Akzente und Hitzestöße."
    },
    "related": [
      "Whip crack",
      "Tennis smash"
    ],
    "demo": {
      "kind": "keys",
      "grip": "vertical",
      "speed": 1.0,
      "source": "Aufguss.it 26 Slaps, watched and keyframed by hand",
      "keys": [
        [
          0.0,
          [
            -0.3,
            1.75,
            0.25
          ],
          [
            -0.12,
            1.15,
            0.25
          ]
        ],
        [
          0.28,
          [
            0.08,
            2.0,
            0.05
          ],
          [
            -0.02,
            1.6,
            0.12
          ]
        ],
        [
          0.42,
          [
            0.38,
            1.45,
            0.5
          ],
          [
            0.18,
            1.05,
            0.42
          ]
        ],
        [
          0.6,
          [
            0.15,
            1.3,
            0.4
          ],
          [
            0.02,
            0.95,
            0.32
          ]
        ],
        [
          0.8,
          [
            -0.2,
            1.5,
            0.3
          ],
          [
            -0.12,
            1.0,
            0.28
          ]
        ]
      ]
    },
    "videos": [
      {
        "url": "https://www.youtube.com/watch?v=RTUyyz0JPLE",
        "title": "Aufguss.it 26 – Slaps"
      }
    ],
    "clip": {
      "id": "RTUyyz0JPLE",
      "start": 34.0,
      "end": 36.0,
      "credit": "Aufguss.it",
      "check": true
    }
  },
  {
    "no": 21,
    "id": "throw-catch",
    "code": "T1",
    "level": 2,
    "family": "throw",
    "tool": "towel",
    "hands": 2,
    "towels": 1,
    "air": 1,
    "heat": 1,
    "show": 3,
    "phase": [
      "distribute"
    ],
    "status": "described",
    "name": {
      "en": "Throw and catch",
      "de": "Werfen und Fangen"
    },
    "aka": [
      "Toss"
    ],
    "desc": {
      "en": "Easy throws: from two hands to one, from one hand to the other. Dropping the towel costs points at championships.",
      "de": "Einfache Würfe: von zwei Händen in eine, von einer Hand in die andere. Ein fallendes Tuch kostet bei Meisterschaften Punkte."
    },
    "use": {
      "en": "Show effect early in the infusion, while it's not too hot yet.",
      "de": "Show-Effekt früh im Aufguss, solange es noch nicht zu heiß ist."
    },
    "related": [
      "Color guard tosses",
      "Ribbon échappé",
      "Frisbee",
      "Juggling"
    ],
    "demo": {
      "kind": "throw",
      "speed": 0.8
    }
  },
  {
    "no": 22,
    "id": "affenschaukel",
    "code": "F?",
    "level": 2,
    "family": "sweep",
    "tool": "towel",
    "hands": 2,
    "towels": 1,
    "air": 2,
    "heat": 2,
    "show": 2,
    "phase": [
      "distribute"
    ],
    "status": "named",
    "name": {
      "en": "Monkey swing",
      "de": "Affenschaukel"
    },
    "aka": [],
    "desc": {
      "en": "Named among the classic techniques. (Description to verify.)",
      "de": "Unter den klassischen Techniken genannt. (Beschreibung noch prüfen.)"
    },
    "use": {
      "en": "To verify.",
      "de": "Noch prüfen."
    },
    "related": [],
    "demo": {
      "kind": "sweep",
      "speed": 0.8
    }
  },
  {
    "no": 23,
    "id": "libelle",
    "code": "R?·2T",
    "level": 2,
    "family": "rotation",
    "tool": "towel",
    "hands": 2,
    "towels": 2,
    "air": 2,
    "heat": 2,
    "show": 2,
    "phase": [
      "distribute"
    ],
    "status": "named",
    "name": {
      "en": "Dragonfly",
      "de": "Libelle"
    },
    "aka": [],
    "desc": {
      "en": "Event technique (teaching video series no. 12). (Description to verify.)",
      "de": "Event-Technik (Lernvideo-Reihe Nr. 12). (Beschreibung noch prüfen.)"
    },
    "use": {
      "en": "To verify.",
      "de": "Noch prüfen."
    },
    "related": [],
    "demo": {
      "kind": "rotate",
      "plane": "horizontal",
      "speed": 1.3,
      "twoTowels": true
    },
    "videos": [
      {
        "url": "https://www.youtube.com/watch?v=AhzU6AE06rI",
        "title": "Event-Aufgüsse Lernvideo Nr. 12 – Libelle"
      }
    ]
  },
  {
    "no": 24,
    "id": "raute",
    "code": "X?",
    "level": 2,
    "family": "eight",
    "tool": "towel",
    "hands": 2,
    "towels": 1,
    "air": 2,
    "heat": 2,
    "show": 2,
    "phase": [
      "distribute"
    ],
    "status": "named",
    "name": {
      "en": "Diamond",
      "de": "Raute"
    },
    "aka": [],
    "desc": {
      "en": "Event technique (teaching video series no. 13). (Description to verify.)",
      "de": "Event-Technik (Lernvideo-Reihe Nr. 13). (Beschreibung noch prüfen.)"
    },
    "use": {
      "en": "To verify.",
      "de": "Noch prüfen."
    },
    "related": [],
    "demo": {
      "kind": "eight",
      "speed": 0.9
    }
  },
  {
    "no": 25,
    "id": "flag-to-back",
    "code": "F5",
    "tool": "towel",
    "hands": 2,
    "towels": 1,
    "air": 3,
    "heat": 2,
    "show": 2,
    "phase": [
      "distribute"
    ],
    "status": "named",
    "related": [],
    "aka": [
      "Rotazione a bandiera fino alla schiena"
    ],
    "videos": [],
    "level": 2,
    "family": "sweep",
    "name": {
      "en": "Flag rotation to the back",
      "de": "Fahnen-Drehung bis zum Rücken"
    },
    "desc": {
      "en": "A flag movement where the towel rotates all the way to your back, using the arms from behind to move air around the heater. (Details to verify.)",
      "de": "Eine Fahnenbewegung, bei der das Tuch bis zum Rücken dreht und die Arme von hinten Luft um den Ofen bewegen. (Details noch prüfen.)"
    },
    "use": {
      "en": "Moves air around the heater.",
      "de": "Bewegt Luft um den Ofen herum."
    },
    "demo": {
      "kind": "sweep",
      "speed": 0.9
    }
  },
  {
    "no": 26,
    "id": "double-pizza",
    "code": "P1·2T",
    "level": 3,
    "family": "flatspin",
    "tool": "towel",
    "hands": 2,
    "towels": 2,
    "air": 2,
    "heat": 1,
    "show": 3,
    "phase": [
      "distribute"
    ],
    "status": "named",
    "name": {
      "en": "Double pizza",
      "de": "Doppel-Pizza"
    },
    "aka": [],
    "desc": {
      "en": "Pizza with two towels at once. (Details to verify.)",
      "de": "Pizza mit zwei Tüchern gleichzeitig. (Details noch prüfen.)"
    },
    "use": {
      "en": "Show highlight.",
      "de": "Show-Höhepunkt."
    },
    "related": [
      "Poi butterfly",
      "Double plate spinning"
    ],
    "demo": {
      "kind": "flatspin",
      "speed": 1.6,
      "twoTowels": true
    }
  },
  {
    "no": 27,
    "id": "super-eight",
    "code": "X1·XL",
    "level": 3,
    "family": "eight",
    "tool": "towel",
    "hands": 2,
    "towels": 1,
    "air": 3,
    "heat": 2,
    "show": 3,
    "phase": [
      "distribute"
    ],
    "status": "described",
    "name": {
      "en": "Super eight",
      "de": "Super-Acht"
    },
    "aka": [
      "Super 8",
      "Super Otto"
    ],
    "desc": {
      "en": "Aufguss.it version: a big towel held at one end, swung in a huge sideways figure eight. One loop on each side of the body: up across the front past the head, down on the outside. Elsewhere 'Super eight' also means two smaller towels in figure eights, one hand half a turn behind. To decide: which one we call Super 8.",
      "de": "Version von Aufguss.it: ein großes Tuch an einem Ende gehalten und in einer riesigen liegenden Acht geschwungen. Je eine Schleife auf jeder Körperseite: vorne am Kopf vorbei nach oben, außen nach unten. Anderswo heißt „Super-Acht“ auch: zwei kleinere Tücher in Achten, eine Hand eine halbe Drehung hinterher. Zu entscheiden: was wir Super 8 nennen."
    },
    "use": {
      "en": "Show highlight with lots of air.",
      "de": "Show-Höhepunkt mit viel Luft."
    },
    "related": [
      "Poi split-time figure eight",
      "Double nunchaku"
    ],
    "demo": {
      "kind": "keys",
      "grip": "corner",
      "big": true,
      "speed": 0.55,
      "source": "Aufguss.it 9 Super 8, watched and keyframed by hand",
      "keys": [
        [
          0.0,
          [
            0.05,
            1.72,
            0.44
          ],
          null
        ],
        [
          0.0833,
          [
            0.26,
            1.962,
            0.385
          ],
          null
        ],
        [
          0.1667,
          [
            0.414,
            1.962,
            0.275
          ],
          null
        ],
        [
          0.25,
          [
            0.47,
            1.72,
            0.22
          ],
          null
        ],
        [
          0.3333,
          [
            0.414,
            1.478,
            0.275
          ],
          null
        ],
        [
          0.4167,
          [
            0.26,
            1.478,
            0.385
          ],
          null
        ],
        [
          0.5,
          [
            0.05,
            1.72,
            0.44
          ],
          null
        ],
        [
          0.5833,
          [
            -0.16,
            1.962,
            0.385
          ],
          null
        ],
        [
          0.6667,
          [
            -0.314,
            1.962,
            0.275
          ],
          null
        ],
        [
          0.75,
          [
            -0.37,
            1.72,
            0.22
          ],
          null
        ],
        [
          0.8333,
          [
            -0.314,
            1.478,
            0.275
          ],
          null
        ],
        [
          0.9167,
          [
            -0.16,
            1.478,
            0.385
          ],
          null
        ]
      ]
    },
    "videos": [
      {
        "url": "https://www.youtube.com/watch?v=Un7K5BZAVz8",
        "title": "Aufguss.it 9 – Super 8"
      }
    ],
    "clip": {
      "id": "Un7K5BZAVz8",
      "start": 32.8,
      "end": 35.2,
      "credit": "Aufguss.it",
      "check": true
    }
  },
  {
    "no": 28,
    "id": "japanese-snake",
    "code": "W3",
    "level": 3,
    "family": "wave",
    "tool": "towel",
    "hands": 2,
    "towels": 1,
    "air": 2,
    "heat": 1,
    "show": 3,
    "phase": [
      "distribute"
    ],
    "status": "described",
    "name": {
      "en": "Japanese snake",
      "de": "Japanische Schlange"
    },
    "aka": [],
    "desc": {
      "en": "A set sequence: the rolled towel is released, each hand holds two corners, the arms swing sideways and back and unroll the towel into a double pizza. Towel size matters.",
      "de": "Eine feste Abfolge: Das gerollte Tuch wird freigegeben, jede Hand hält zwei Ecken, die Arme schwingen seitlich und zurück und rollen das Tuch zu einer Doppel-Pizza aus. Die Tuchgröße ist entscheidend."
    },
    "use": {
      "en": "Show only; not for classic or meditative infusions.",
      "de": "Nur Show; nicht für klassische oder meditative Aufgüsse."
    },
    "related": [
      "Ribbon snakes",
      "Water sleeves"
    ],
    "demo": {
      "kind": "wave",
      "speed": 1
    }
  },
  {
    "no": 29,
    "id": "snake",
    "code": "W2",
    "level": 3,
    "family": "wave",
    "tool": "towel",
    "hands": 1,
    "towels": 1,
    "air": 1,
    "heat": 1,
    "show": 3,
    "phase": [
      "distribute"
    ],
    "status": "named",
    "name": {
      "en": "Snake",
      "de": "Schlange"
    },
    "aka": [],
    "desc": {
      "en": "An undulating wave of the towel in front of the body.",
      "de": "Eine wellenförmige Bewegung des Tuchs vor dem Körper."
    },
    "use": {
      "en": "Show element.",
      "de": "Show-Element."
    },
    "related": [
      "Ribbon snakes"
    ],
    "demo": {
      "kind": "wave",
      "speed": 1.1,
      "oneHand": true
    }
  },
  {
    "no": 30,
    "id": "angelo",
    "code": "X4",
    "level": 3,
    "family": "eight",
    "tool": "towel",
    "hands": 2,
    "towels": 2,
    "air": 2,
    "heat": 1,
    "show": 3,
    "phase": [
      "distribute"
    ],
    "status": "named",
    "name": {
      "en": "Angel wings",
      "de": "Engelsflügel (Angelo)"
    },
    "aka": [
      "Angelo",
      "Angel wings",
      "Skrzydła anioła (PL)",
      "Tecnica a infinito"
    ],
    "desc": {
      "en": "The towel is opened at the shoulder and unrolls like a wing as you move. Its path draws an infinity sign (∞). Often with two towels.",
      "de": "Das Tuch wird an der Schulter geöffnet und rollt sich in der Bewegung wie ein Flügel aus. Die Bahn zeichnet ein Unendlich-Zeichen (∞). Oft mit zwei Tüchern."
    },
    "use": {
      "en": "Show element.",
      "de": "Show-Element."
    },
    "related": [
      "Poi butterfly"
    ],
    "demo": {
      "kind": "sweep",
      "speed": 0.9,
      "twoTowels": true
    }
  },
  {
    "no": 31,
    "id": "disco",
    "code": "R?",
    "level": 3,
    "family": "rotation",
    "tool": "towel",
    "hands": 1,
    "towels": 1,
    "air": 2,
    "heat": 2,
    "show": 3,
    "phase": [
      "distribute"
    ],
    "status": "named",
    "name": {
      "en": "Disco",
      "de": "Disco"
    },
    "aka": [],
    "desc": {
      "en": "Modern technique, dance-style. (Details to verify.)",
      "de": "Moderne Technik im Tanzstil. (Details noch prüfen.)"
    },
    "use": {
      "en": "Show element.",
      "de": "Show-Element."
    },
    "related": [
      "Disco dance"
    ],
    "demo": {
      "kind": "rotate",
      "plane": "tilted",
      "speed": 1.3
    }
  },
  {
    "no": 32,
    "id": "around-the-moon",
    "code": "T2",
    "level": 3,
    "family": "throw",
    "tool": "towel",
    "hands": 1,
    "towels": 1,
    "air": 1,
    "heat": 1,
    "show": 3,
    "phase": [
      "distribute"
    ],
    "status": "named",
    "name": {
      "en": "Around the moon / sun",
      "de": "Um den Mond / die Sonne"
    },
    "aka": [],
    "desc": {
      "en": "A toss and catch with a turn; seen at the world championships. (Details to verify.)",
      "de": "Wurf und Fang mit Drehung; bei der WM gesehen. (Details noch prüfen.)"
    },
    "use": {
      "en": "Show highlight.",
      "de": "Show-Höhepunkt."
    },
    "related": [
      "Color guard flip toss"
    ],
    "demo": {
      "kind": "throw",
      "speed": 0.8,
      "spin": true
    },
    "videos": [
      {
        "url": "https://www.youtube.com/watch?v=HN63qiPv45o",
        "title": "Show Aufguss: advanced towel waving techniques"
      }
    ]
  },
  {
    "no": 33,
    "id": "dirty-copter",
    "code": "R4",
    "level": 3,
    "family": "rotation",
    "tool": "towel",
    "hands": 1,
    "towels": 1,
    "air": 2,
    "heat": 2,
    "show": 2,
    "phase": [
      "distribute"
    ],
    "status": "named",
    "name": {
      "en": "Dirty copter",
      "de": "Dirty Copter"
    },
    "aka": [],
    "desc": {
      "en": "A helicopter that rescues a towel that has folded on itself, so you keep momentum and look good.",
      "de": "Ein Hubschrauber, der ein in sich zusammengefallenes Tuch rettet, damit der Schwung bleibt."
    },
    "use": {
      "en": "Recovery move inside flows.",
      "de": "Rettungsbewegung in Flows."
    },
    "related": [],
    "demo": {
      "kind": "rotate",
      "plane": "horizontal",
      "speed": 1.5
    },
    "videos": [
      {
        "url": "https://www.youtube.com/watch?v=9PxUf3MQp_g",
        "title": "The Dirty copter (+ tier list)"
      }
    ]
  },
  {
    "no": 34,
    "id": "maikaefer",
    "code": "R?·2T",
    "level": 3,
    "family": "rotation",
    "tool": "towel",
    "hands": 2,
    "towels": 2,
    "air": 2,
    "heat": 2,
    "show": 3,
    "phase": [
      "distribute"
    ],
    "status": "named",
    "name": {
      "en": "Cockchafer",
      "de": "Maikäfer"
    },
    "aka": [],
    "desc": {
      "en": "Show technique (teaching video series no. 28). (Description to verify.)",
      "de": "Show-Technik (Lernvideo-Reihe Nr. 28). (Beschreibung noch prüfen.)"
    },
    "use": {
      "en": "To verify.",
      "de": "Noch prüfen."
    },
    "related": [],
    "demo": {
      "kind": "rotate",
      "plane": "wall",
      "speed": 1.2,
      "twoTowels": true
    },
    "videos": [
      {
        "url": "https://www.youtube.com/watch?v=LuS99UsRARs",
        "title": "Show-Aufgüsse Lernvideo Nr. 28 – Maikäfer"
      }
    ]
  },
  {
    "no": 35,
    "id": "big-towel",
    "code": "F1·XL",
    "level": 3,
    "family": "sweep",
    "tool": "big towel",
    "hands": 2,
    "towels": 1,
    "air": 3,
    "heat": 3,
    "show": 2,
    "phase": [
      "distribute",
      "peak"
    ],
    "status": "described",
    "name": {
      "en": "Big towel (150×100)",
      "de": "Großes Tuch (150×100)"
    },
    "aka": [],
    "desc": {
      "en": "The same techniques with a large towel: more strength and body movement, more air.",
      "de": "Dieselben Techniken mit großem Tuch: mehr Kraft und Körpereinsatz, mehr Luft."
    },
    "use": {
      "en": "Big saunas.",
      "de": "Große Saunen."
    },
    "related": [
      "Sbandieratori"
    ],
    "demo": {
      "kind": "sweep",
      "speed": 0.8,
      "big": true
    }
  },
  {
    "no": 36,
    "id": "twirl",
    "code": "D1",
    "tool": "towel",
    "hands": 1,
    "towels": 1,
    "air": 1,
    "heat": 1,
    "show": 3,
    "phase": [
      "distribute"
    ],
    "status": "named",
    "related": [
      "Ballet pirouette (spotting)",
      "Baton twirling"
    ],
    "aka": [
      "Piroetta"
    ],
    "videos": [],
    "level": 3,
    "family": "pass",
    "name": {
      "en": "Twirl (pirouette)",
      "de": "Pirouette (Twirl)"
    },
    "desc": {
      "en": "You turn your body once around while the towel keeps flying; one hand ends up behind your back. Base for the combined moves Twirl Angel and Twirl Pizza.",
      "de": "Du drehst dich einmal um dich selbst, während das Tuch weiterfliegt; eine Hand landet hinter dem Rücken. Grundlage für die Kombinationen Twirl-Engel und Twirl-Pizza."
    },
    "use": {
      "en": "Show only.",
      "de": "Nur Show."
    },
    "demo": {
      "kind": "rotate",
      "plane": "horizontal",
      "speed": 1.4
    }
  },
  {
    "no": 37,
    "id": "twirl-angel",
    "code": "D1+X4",
    "tool": "towel",
    "hands": 1,
    "towels": 1,
    "air": 1,
    "heat": 1,
    "show": 3,
    "phase": [
      "distribute"
    ],
    "status": "described",
    "related": [],
    "aka": [
      "Angelo – Piroetta"
    ],
    "videos": [
      {
        "url": "https://www.youtube.com/watch?v=_FGsVbxjGh8",
        "title": "Aufguss.it 15 – Twirl Angel"
      }
    ],
    "level": 3,
    "family": "pass",
    "name": {
      "en": "Twirl angel",
      "de": "Twirl-Engel"
    },
    "desc": {
      "en": "Hold two adjacent corners at your side: one hand at the chest, the other arm stretched out like a wing. Turn your whole body once around (a twirl) and keep the towel open, so it flies flat around you. Spot like a dancer so you don't get dizzy (tutorial: difficulty ++, air ++).",
      "de": "Zwei benachbarte Ecken an der Seite halten: eine Hand an der Brust, der andere Arm ausgestreckt wie ein Flügel. Den ganzen Körper einmal herumdrehen (Twirl) und das Tuch offen halten, sodass es flach um dich fliegt. Mit dem Blick einen Punkt fixieren wie beim Tanzen, damit dir nicht schwindlig wird (Tutorial: Schwierigkeit ++, Luft ++)."
    },
    "use": {
      "en": "Very showy; for show infusions only.",
      "de": "Sehr showreich; nur für Show-Aufgüsse."
    },
    "demo": {
      "kind": "keys",
      "grip": "spread",
      "speed": 0.6,
      "spin": 1,
      "cloth": [
        0.85,
        0.6
      ],
      "source": "Aufguss.it 15 Twirl Angel, watched and keyframed by hand",
      "keys": [
        [
          0.0,
          [
            0.55,
            1.5,
            0.1
          ],
          [
            0.05,
            1.38,
            0.25
          ]
        ],
        [
          0.5,
          [
            0.56,
            1.56,
            0.05
          ],
          [
            0.06,
            1.42,
            0.22
          ]
        ]
      ]
    },
    "clip": {
      "id": "_FGsVbxjGh8",
      "start": 43.8,
      "end": 46.0,
      "credit": "Aufguss.it",
      "check": true
    }
  },
  {
    "no": 38,
    "id": "twirl-pizza",
    "code": "D1+P1",
    "tool": "towel",
    "hands": 1,
    "towels": 1,
    "air": 1,
    "heat": 1,
    "show": 3,
    "phase": [
      "distribute"
    ],
    "status": "described",
    "related": [],
    "aka": [
      "Piroetta – Pizza"
    ],
    "videos": [
      {
        "url": "https://www.youtube.com/watch?v=n60EEXnAYhc",
        "title": "Aufguss.it 17 – Twirl Pizza"
      }
    ],
    "level": 3,
    "family": "flatspin",
    "name": {
      "en": "Twirl pizza",
      "de": "Twirl-Pizza"
    },
    "desc": {
      "en": "Start like the oblique flag at your side, two adjacent corners. Turn your whole body once around and let the towel spin flat around you at shoulder height like a pizza; finish facing the guests with the towel spread overhead, then let it drop in front.",
      "de": "Wie die schräge Fahne an der Seite beginnen, zwei benachbarte Ecken. Den ganzen Körper einmal herumdrehen und das Tuch auf Schulterhöhe flach um dich kreisen lassen wie eine Pizza; zu den Gästen gewandt mit dem Tuch ausgebreitet über dem Kopf enden, dann vorne fallen lassen."
    },
    "use": {
      "en": "Show only.",
      "de": "Nur Show."
    },
    "demo": {
      "kind": "keys",
      "grip": "spread",
      "speed": 0.5,
      "spin": 1,
      "cloth": [
        0.85,
        0.65
      ],
      "source": "Aufguss.it 17 Twirl Pizza, watched and keyframed by hand",
      "keys": [
        [
          0.0,
          [
            0.45,
            1.6,
            0.1
          ],
          [
            0.05,
            1.45,
            0.25
          ]
        ],
        [
          0.45,
          [
            0.5,
            1.82,
            0.05
          ],
          [
            0.1,
            1.7,
            0.2
          ]
        ],
        [
          0.78,
          [
            0.3,
            2.0,
            0.0
          ],
          [
            -0.3,
            2.0,
            0.0
          ]
        ],
        [
          0.92,
          [
            0.42,
            1.62,
            0.12
          ],
          [
            0.02,
            1.47,
            0.24
          ]
        ]
      ]
    },
    "clip": {
      "id": "n60EEXnAYhc",
      "start": 30.0,
      "end": 37.0,
      "credit": "Aufguss.it",
      "check": true
    }
  },
  {
    "no": 39,
    "id": "open-close-big",
    "code": "W1·XL",
    "tool": "big towel",
    "hands": 2,
    "towels": 1,
    "air": 3,
    "heat": 2,
    "show": 2,
    "phase": [
      "distribute"
    ],
    "status": "described",
    "related": [],
    "aka": [],
    "videos": [
      {
        "url": "https://www.youtube.com/watch?v=rDgSMBsU1sg",
        "title": "Aufguss.it 51 – Open & Close big towel"
      }
    ],
    "level": 3,
    "family": "wave",
    "name": {
      "en": "Open & close (big towel)",
      "de": "Öffnen & Schließen (großes Tuch)"
    },
    "desc": {
      "en": "Big towel, both hands on one edge, beside the body. Open it up into a full vertical sheet, flip it flat like a tabletop, sweep it low and gather it again, then repeat. The big surface pushes a lot of air sideways along the benches.",
      "de": "Großes Tuch, beide Hände an einer Kante, neben dem Körper. Zu einer vollen senkrechten Fläche öffnen, flach wie eine Tischplatte kippen, tief durchziehen und wieder sammeln, dann wiederholen. Die große Fläche schiebt viel Luft seitlich an den Bänken entlang."
    },
    "use": {
      "en": "Moves a lot of air with elegance.",
      "de": "Bewegt viel Luft mit Eleganz."
    },
    "demo": {
      "kind": "keys",
      "grip": "spread",
      "speed": 0.8,
      "cloth": [
        0.72,
        1.0
      ],
      "source": "Aufguss.it 51 Open&Close big towel, watched and keyframed by hand",
      "keys": [
        [
          0.0,
          [
            0.05,
            1.25,
            0.25
          ],
          [
            -0.5,
            1.2,
            0.25
          ]
        ],
        [
          0.2,
          [
            0.1,
            1.85,
            0.15
          ],
          [
            -0.58,
            1.75,
            0.1
          ]
        ],
        [
          0.38,
          [
            0.12,
            1.7,
            0.6
          ],
          [
            -0.55,
            1.6,
            0.55
          ]
        ],
        [
          0.6,
          [
            0.05,
            1.15,
            0.5
          ],
          [
            -0.58,
            1.1,
            0.4
          ]
        ],
        [
          0.82,
          [
            0.0,
            1.2,
            0.3
          ],
          [
            -0.48,
            1.15,
            0.28
          ]
        ]
      ]
    },
    "clip": {
      "id": "rDgSMBsU1sg",
      "start": 44.8,
      "end": 46.8,
      "credit": "Aufguss.it",
      "check": true
    }
  },
  {
    "no": 40,
    "id": "finger-twirl",
    "code": "P2",
    "tool": "towel",
    "hands": 1,
    "towels": 1,
    "air": 1,
    "heat": 1,
    "show": 3,
    "phase": [
      "distribute"
    ],
    "status": "named",
    "related": [],
    "aka": [],
    "videos": [
      {
        "url": "https://www.youtube.com/watch?v=J5-KKZZsc7M",
        "title": "Finger twirl – Aufguss waving (with slow motion)"
      }
    ],
    "level": 3,
    "family": "flatspin",
    "name": {
      "en": "Finger twirl",
      "de": "Finger-Twirl"
    },
    "desc": {
      "en": "The towel is spun on the fingers. (Details to verify.)",
      "de": "Das Tuch wird auf den Fingern gedreht. (Details noch prüfen.)"
    },
    "use": {
      "en": "Show element.",
      "de": "Show-Element."
    },
    "demo": {
      "kind": "flatspin",
      "speed": 1.8
    }
  },
  {
    "no": 41,
    "id": "curls",
    "code": "W?",
    "tool": "towel",
    "hands": 1,
    "towels": 1,
    "air": 1,
    "heat": 1,
    "show": 3,
    "phase": [
      "distribute"
    ],
    "status": "named",
    "related": [],
    "aka": [],
    "videos": [
      {
        "url": "https://www.youtube.com/watch?v=9PxUf3MQp_g",
        "title": "The Dirty copter (+ tier list)"
      },
      {
        "url": "https://www.youtube.com/watch?v=HN63qiPv45o",
        "title": "Show Aufguss: advanced techniques"
      }
    ],
    "level": 3,
    "family": "wave",
    "name": {
      "en": "Curls",
      "de": "Curls"
    },
    "desc": {
      "en": "Named in the advanced tier list. (Description to verify.)",
      "de": "In der Profi-Rangliste genannt. (Beschreibung noch prüfen.)"
    },
    "use": {
      "en": "To verify.",
      "de": "Noch prüfen."
    },
    "demo": {
      "kind": "wave",
      "speed": 1
    }
  },
  {
    "no": 42,
    "id": "flips",
    "code": "T?",
    "tool": "towel",
    "hands": 1,
    "towels": 1,
    "air": 1,
    "heat": 1,
    "show": 3,
    "phase": [
      "distribute"
    ],
    "status": "named",
    "related": [],
    "aka": [],
    "videos": [
      {
        "url": "https://www.youtube.com/watch?v=9PxUf3MQp_g",
        "title": "The Dirty copter (+ tier list)"
      },
      {
        "url": "https://www.youtube.com/watch?v=HN63qiPv45o",
        "title": "Show Aufguss: advanced techniques"
      }
    ],
    "level": 3,
    "family": "throw",
    "name": {
      "en": "Flips",
      "de": "Flips"
    },
    "desc": {
      "en": "Named in the advanced tier list. (Description to verify.)",
      "de": "In der Profi-Rangliste genannt. (Beschreibung noch prüfen.)"
    },
    "use": {
      "en": "To verify.",
      "de": "Noch prüfen."
    },
    "demo": {
      "kind": "throw",
      "speed": 1
    }
  },
  {
    "no": 43,
    "id": "fishing",
    "code": "S?",
    "tool": "towel",
    "hands": 1,
    "towels": 1,
    "air": 1,
    "heat": 1,
    "show": 3,
    "phase": [
      "distribute"
    ],
    "status": "named",
    "related": [],
    "aka": [],
    "videos": [
      {
        "url": "https://www.youtube.com/watch?v=9PxUf3MQp_g",
        "title": "The Dirty copter (+ tier list)"
      },
      {
        "url": "https://www.youtube.com/watch?v=HN63qiPv45o",
        "title": "Show Aufguss: advanced techniques"
      }
    ],
    "level": 3,
    "family": "whip",
    "name": {
      "en": "Fishing",
      "de": "Angeln (Fishing)"
    },
    "desc": {
      "en": "Named in the advanced tier list. (Description to verify.)",
      "de": "In der Profi-Rangliste genannt. (Beschreibung noch prüfen.)"
    },
    "use": {
      "en": "To verify.",
      "de": "Noch prüfen."
    },
    "demo": {
      "kind": "whip",
      "speed": 1
    }
  }
];
