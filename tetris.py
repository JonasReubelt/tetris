import pygame

WIDTH = 400
HEIGHT = 800

RED = (255, 0, 0)
GREEN = (0, 255, 0)
BLUE = (0, 0, 255)
BLACK = (0, 0, 0)

class Block(object):
    def __init__(self, kind):
        self.kind = kind
        self.configure(kind)
        self.color = RED
        self.dead = False

    def configure(self, kind):
        if kind == 'square':
            self.rects = [[4 * WIDTH / 10, 0, WIDTH / 10, HEIGHT / 20],
                          [5 * WIDTH / 10, 0, WIDTH / 10, HEIGHT / 20],
                          [4 * WIDTH / 10, HEIGHT / 20, WIDTH / 10, HEIGHT / 20],
                          [5 * WIDTH / 10, HEIGHT / 20, WIDTH / 10, HEIGHT / 20]]

    def drop(self):
        for i in range(len(self.rects)):
            self.rects[i][1] += HEIGHT / 20
        else:
            self.dead = True
    def draw(self):
        for rect in self.rects:
            pygame.draw.rect(DISPLAY, self.color, rect)
    def is_dead(self):
        return self.dead
    def move(self, where):
        if where == 'left' and self.x > 0:
            self.x -= WIDTH / 10
        if where == 'right' and self.x < 9 * WIDTH / 10:
            self.x += WIDTH / 10

bottoms = 10 * [HEIGHT * 19 / 20]

DISPLAY = pygame.display.set_mode((WIDTH, HEIGHT))

clock = pygame.time.Clock()

pygame.init()
pygame.display.set_caption('Tetris')
pygame.display.update()

running = True

speed = 0
block = Block('square')


while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        if event.type == pygame.KEYDOWN:
            if event.key == pygame.K_LEFT:
                block.move('left')
            if event.key == pygame.K_RIGHT:
                block.move('right')

    DISPLAY.fill(BLACK)
    block.draw()
    speed += 1
    if speed == 20:
        block.drop()
        speed = 0
    pygame.display.update()
    clock.tick(60)

pygame.quit()
