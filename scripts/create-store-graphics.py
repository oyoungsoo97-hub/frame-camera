"""Render the existing FRAME vector-style brand, not a fabricated app screenshot."""
from PIL import Image,ImageDraw,ImageFont
from pathlib import Path
root=Path(__file__).resolve().parent.parent
out=root/'store/assets';out.mkdir(exist_ok=True)
latin='/System/Library/Fonts/Supplemental/Arial Bold.ttf'
korean='/System/Library/Fonts/AppleSDGothicNeo.ttc'
for code,line in [('de','Dein Foto. Dein bester Winkel.'),('en','Your photo. Your best angle.'),('ko','나만의 사진, 나에게 맞는 구도.')]:
 im=Image.new('RGB',(1024,500),'#174BFF');d=ImageDraw.Draw(im)
 # Framing brackets from the app's visual language.
 for x,y,sx,sy in [(64,64,1,1),(960,64,-1,1),(64,436,1,-1),(960,436,-1,-1)]:
  d.line([(x,y+sy*46),(x,y),(x+sx*46,y)],fill='white',width=4)
 d.text((115,130),'frame.',font=ImageFont.truetype(latin,124),fill='white')
 d.text((121,288),line,font=ImageFont.truetype(korean if code=='ko' else latin,34),fill='white')
 im.save(out/f'google-play-feature-{code}-1024x500.png')
