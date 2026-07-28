# HFOVCalc

Você já deve ter ouvido fotógrafos e filmakers dizendo frases como: "Coloca uma 35mm aqui" ou "Essa 24mm no full frame equivale a uma 16mm no Super 35".

Mas você já parou para pensar de onde vem o número do ângulo que essa lente enxerga? E mais importante: quantos metros de largura você vai enquadrar a uma certa distância?

🎬 Desvendando HFOV e HFW

Quando falamos sobre o ângulo de uma lente, estamos nos referindo genericamente ao seu AoV (Angle of View). Na prática, esse termo se divide em três: o diagonal (DFOV), o vertical (VFOV) e o horizontal (HFOV). Neste artigo, vou te mostrar de forma leve e geométrica como calcular o HFOV (Horizontal Field of View) e o HFW (Horizontal Field Width), usando o fator de corte ou a equivalência de 35mm. No final, você terá uma série de ferramentas para resolver questões em torno desses conceitos no set. Vamos lá! 🎬

📐 Conceito 1: HFOV (Ângulo de Visão Horizontal)

O HFOV (Horizontal Field of View) é o ângulo de visão que a lente enxerga especificamente na horizontal, medido em graus (°).

A Fórmula do HFOV

O primeiro ponto que precisamos ter em mente é a compreensão do que é distância focal. Ela é a distância entre o centro óptico da lente e a superfície do sensor.
Porém, quando o sensor é menor que um fotograma de 35mm, ou seja, não é Full Frame, o fabricante fornece a distância focal de duas formas:

Real (que é a distância física do centro focal da lente até a superfície do sensor);

Equivalente a 35mm (valor real multiplicado por um fator de equivalência).

Mas, afinal, o que é uma distância focal equivalente a 35 mm?
Imagine que você pegou um sensor menor e o esticou até que sua diagonal atingisse 43,2666mm, que é a diagonal do clássico filme de 35 mm (36 x 24 mm e aspecto 3:2). Considere que a lente seria esticada junto com o sensor nesse processo. Se a lente cresce, a distância entre o centro óptico dela e o sensor também aumenta, não é mesmo? Pois é exatamente esse novo valor que chamamos de distância focal equivalente a 35 mm.

Essa separação é necessária para os cálculos, pois, caso a distância focal dada for o equivalente a 35mm, você irá considerar a largura do sensor como 36mm. Por outro lado, se você tem o valor da distância focal real, irá valer-se da largura real do sensor.

Agora que esclarecemos esses pontos, vamos pensar no triângulo retângulo que é formado dentro da câmera, entre a distância focal e metade do sensor. Isso é o que vemos na ilustração abaixo.

Observe que:

{x} = \frac{\text{Largura do Sensor}}{2} \gets \text{ É o cateto oposto ao ângulo}\\
{}\\
{z} = \text{Distância Focal} \gets \text{É o cateto adjacente ao ângulo}

Como a tangente é o cateto oposto sobre o adjacente, o ângulo pode ser calculado pelo inverso da tangente:

\alpha = \arctan \bigg( \frac{x}{z} \bigg)\\

E sendo o HFOV o dobro desse ângulo, podemos calcular direto como:

\text{HFOV} = 2 \times \arctan\bigg( \frac{x}{z} \bigg)

Essa é a forma geométrica mais direta e simples. Ela é a base para se calcular o ângulo, tanto para câmeras com lentes e sensores Full Frame quanto para lentes e sensores menores. Como já dissemos, basta usar valores coerentes para x e z , ou seja, ambos reais ou ambos equivalentes. É o que veremos em seguida, quando utilizamos o fator de corte para equilibrar os dois termos.

Para calcular o HFOV a partir da equivalência de 35mm por fator de corte da câmera, usamos:

\text{HFOV} = 2 \times \arctan\left( \frac{18}{\text{Distância Focal} \times \text{Fator de Corte}} \right)

Onde:

18 é o cateto oposto, com a metade da Largura de um Sensor de 36mm (Full Frame).

Fator de Corte = número que indica quantas vezes seu sensor é menor que o Full Frame.

A Distância Focal multiplicada pelo Fator de Corte é o cateto adjacente. A multiplicação transforma a distância focal em seu valor equivalente  em 35mm (ou aproximado, para aspectos diferentes de 3:2). 

Dizemos que em alguns casos o cálculo pode ser apenas aproximado, porque o fator de corte fornecido pelo fabricante é dado pela diferença diagonal entre o sensor real e o sensor de referência (36x24mm e aspecto 3:2). Para valores precisos, naqueles casos em que o aspecto do sensor real é diferente de 3:2, precisaríamos primeiro calcular o fator de corte horizontal para, depois, utilizá-lo na fórmula acima.

Reforçando, isso ocorre porque o fator de corte horizontal muda quando o aspecto do sensor não é 3:2 como são os de 35mm. Ou seja, os fatores de corte diagonal, horizontal ou mesmo o vertical serão diferentes entre si, quando o aspecto é 4:3, 16:9, etc. Quando esse for o caso, e você quiser trabalhar com precisão, calcule primeiro o fator de corte horizontal (CH), em função do fator diagonal dado (CD) e do aspecto do sensor dado (a:b), aplicando os seus respectivos valores na fórmula abaixo:

C_H = C_D \times \text{Multiplicador}\\
{}\\
C_H = C_D \times \left(\frac{36}{43,266} \times \frac{\sqrt{a^2 + b^2}}{a}\right)

Após calculado o Fator de Corte Horizontal, pode inseri-lo na fórmula original do HFOV. Todos os dados estarão geometricamente precisos.

Para facilitar, segue abaixo os valores mais comuns de aspecto, com o multiplicador já calculado, para obter o Fator de Corte Horizontal:

AspectoMultiplicador3:21.0000 (ou seja, não precisa corrigir)4:31.039916:90.9545

💡 Todas as fórmulas poderiam ser utilizadas também para calcular o ângulo de abertura vertical (VFOV). Bastaria substituir x por y, mantendo z. Onde y seria a metade da altura do sensor, em vez da largura. Mas atenção a um erro comum: você não deve calcular o ângulo vertical aplicando a proporção do aspecto direto no ângulo horizontal (por exemplo, achar que o VFOV é 3/4 do HFOV em um sensor 4:3). Como a relação envolve trigonometria, os ângulos não mudam de forma linear. Por outro lado, se você aplicar a proporção do aspecto diretamente no tamanho físico da cena capturada, a regra funciona perfeitamente! Em um sensor 4:3, a altura real da cena será exatamente 3/4 da largura. E é justamente esse cálculo da largura física da cena que nos leva ao nosso próximo conceito essencial para o set: o HFW.

📏 Conceito 2: HFW (Largura Física do Campo de Visão Horizontal)

O HFW (Horizontal Field Width) é a largura física da cena capturada, medida em metros. É o que realmente importa no set quando você precisa saber: "Se eu colocar a câmera a 5 metros do ator, quantos metros de largura (HFW) vou enquadrar?"

A Fórmula do HFW

Para calcular o HFW, usamos um triângulo retângulo formado pela distância da câmera até o objeto e a metade da largura da cena:

Onde:

Ângulo: A metade do HFOV (HFOV/2).

Cateto Adjacente ao ângulo: A distância (D) da câmera até o objeto (a partir do centro óptico da lente).

Cateto Oposto ao ângulo: A metade da largura da cena (HFW/2).

Usando a definição da tangente:

\tan\left(\frac{\text{HFOV}}{2}\right) = \frac{\text{HFW}/2}{D}

Isolando o HFW:

\frac{\text{HFW}}{2} = D \times \tan\left(\frac{\text{HFOV}}{2}\right)

\text{HFW} = 2 \times D \times \tan\left(\frac{\text{HFOV}}{2}\right)

🎯 Exemplo Prático

Situação: Você está com uma lente cuja equivalência em 35mm é de 50mm, e quer saber quantos metros de largura (HFW) vai enquadrar a 4 metros de distância.

Passo 1: Vamos calcular o HFOV. Se o valor de distância focal dado é de 50mm em equivalência a 35mm, a conversão para valores em Full Frame já foi feita. Portanto, a largura do sensor será 36mm. Pois, lembre-se: um filme de 35mm tem a largura do fotograma igual a 36mm. Nós utilizamos a metade do sensor para o cálculo, ou seja, 18mm. Assim, teremos:

\text{HFOV} = 2 \times \arctan\left( \frac{18}{50} \right) \to 2 \times 19,79º = 39,6º

Passo 2: Para o cálculo do HFW, tomaremos a metade do HFOV (exatamente o semiângulo 19,79º encontrado no meio do cálculo anterior):

\frac{39,6º}{2} = 19,79º

Passo 3: Calculamos a largura (HFW) usando a tangente desse ângulo e a distância de 4 metros:

\text{HFW} = 2 \times 4 \times \tan(19,79º) \to 8 \times 0,36 = 2,87 \text{ metros}

Resultado: A 4 metros de distância, sua cena enquadrada terá uma largura física (HFW) de aproximadamente 2,87 metros.

🧠 Resumo para Lembrar

O Que Você Quer SaberFórmulaUnidadeÂngulo horizontal da lente (HFOV)2 × arctan( Metade da Largura do Sensor / Distância Focal )Graus (°)Largura física da cena (HFW)2 × D × tan( HFOV / 2 )Metros (m)

📝 Tabela de Sensores

TipoLargura (mm)Altura (mm)AspectoFator de Corte1/10"1.280.964:327.041/8" (Sony DCR-SR68, DCR-DVD110E)1.601.204:321.651/6" (Panasonic SDR-H20, SDR-H200)2.401.804:314.141/4"3.602.704:310.811/3.6" (Nokia Lumia 720)4.003.004:38.651/3.2" (iPhone 5)4.543.424:37.611/3.09" Sony EXMOR IMX3514.663.54:37.43Standard 8 mm film frame4.83.511:87.281/3" (iPhone 5S, iPhone 6, LG G3)4.803.604:37.211/2.88" OmniVision OV50D5.053.804:36.841/2.76" Samsung ISOCELL JN15.243.934:36.611/2.7" Fujifilm 2800 Zoom5.374.044:36.44Super 8 mm film frame5.794.0113:96.151/2.5" (Nokia Lumia 1520, Sony Cyber-shot DSC-T5, iPhone XS)5.764.294:36.021/2.3" (Pentax Q, Sony Cyber-shot DSC-W330, GoPro HERO3, Panasonic HX-A500, Google Pixel/Pixel+, DJI Phantom 3/Mavic 2 Zoom), Nikon P1000/P9006.174.554:35.641/2.3" Sony EXMOR IMX2206.304.724:35.491/2" (Fujifilm HS30EXR, Xiaomi Mi 9, OnePlus 7, Espros EPC 660, DJI Mavic Air 2)6.404.804:35.411/1.8" (Nokia N8) (Olympus C-5050, C-5060, C-7070)7.185.324:34.841/1.73" Sony EXMOR IMX6867.45.554:34.681/1.7" (Pentax Q7, Canon G10, G15, Huawei P20 Pro, Huawei P30 Pro, Huawei Mate 20 Pro)7.605.704:34.551/1.6" (Fujifilm F200EXR)8.086.014:34.301/1.55" OmniVision OV50E8.296.224:34.172/3" (Nokia Lumia 1020, Fujifilm X10, X20, XF1)8.806.604:33.931/1.4" Sony LYTIA LYT-8089.186.884:33.771/1.33" (Samsung Galaxy S20 Ultra)9.67.24:33.611/1.28" OmniVision OVB0B10.077.564:33.44Standard 16 mm film frame10.267.4911:83.411/1.2" (Nokia 808 PureView)10.678.004:33.241/1.12" (Xiaomi Mi 11 Ultra)11.428.574:33.03Blackmagic Pocket Cinema Camera & Blackmagic Studio Camera12.487.0216:93.02Super 16 mm film frame12.527.415:32.971" (Nikon CX, Sony RX100, Sony RX10, Sony ZV-1, Samsung NX Mini)13.208.803:22.721" Digital Bolex d1612.809.604:32.701" (Xiaomi 12S Ultra)13.119.834:32.641" Kodak DCS-20014.009.303:22.571.1" Sony IMX25314.1010.3011:82.47Blackmagic Cinema Camera EF15.818.8816:92.38Blackmagic Pocket Cinema Camera 4K18.961019:102.01Four Thirds, Micro Four Thirds ("4/3", "m4/3")17.30134:32.00Blackmagic Production Camera/URSA/URSA Mini 4K21.1211.8816:91.791.5" Canon PowerShot G1 X Mark II18.70144:31.85"35mm" 2 Perf Techniscope21.959.357:31.81original Sigma Foveon X320.7013.803:21.74RED DRAGON 4.5K (RAVEN)23.0010.8019:91.66"Super 35mm" 2 Perf24.899.358:31.62Canon EF-S, APS-C22.3014.903:21.61Standard 35 mm film frame (movie)22.016.011:81.59Blackmagic URSA Mini/Pro 4.6K25.3414.2516:91.49APS-C (Sony α, Sony E, Nikon DX, Pentax K, Samsung NX, Fuji X)23.6–23.715.603:21.52–1.54Super 35 mm film 3 perf24.8913.869:51.51RED DRAGON 5K S3525.613.517:91.49Super 35mm film 4 perf24.8918.664:31.39Canon APS-H27.9018.603:21.29ARRI ALEV III (ALEXA SXT, ALEXA MINI, AMIRA), RED HELIUM 8K S3529.9015.7717:91.28RED DRAGON 6K S3530.715.835:181.2535 mm film full-frame36243:21.0ARRI ALEXA LF36.7025.5413:90.96RED Dragon/Monstro/V-Raptor 8K VV, Panavision Millenium DXL/DXL240.9621.6017:90.93Leica S45303:20.80Pentax 645D, Hasselblad X1D-50c, Hasselblad H6D-50c, CFV-50c, Fujifilm GFX 50S43.832.94:30.79Standard 65/70 mm film frame52.4823.017:30.76ARRI ALEXA 6554.1225.5819:90.72Kodak KAF 39000 CCD4936.804:30.71Leaf AFi 10563614:90.65Medium-format (Hasselblad H5D-60c, Hasselblad H6D-100c)53.740.24:30.65Phase One P 65+, IQ160, IQ18053.9040.404:30.64Medium-format 6×4.5 cm (also called 645 format)42563:40.614Medium-format 6×6 cm56561:10.538IMAX film frame70.4152.634:30.49Medium-format 6×7 cm70565:40.469Medium-format 6×8 cm76563:40.458Medium-format 6×9 cm84563:20.43Large-format film 4×5 inch121975:40.29Large-format film 5×7 inch1781277:50.238Large-format film 8×10 inch2542035:40.143
