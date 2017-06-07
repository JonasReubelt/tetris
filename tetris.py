import pygame

WIDTH = 400
HEIGHT = 800

RED = (255, 0, 0)
GREEN = (0, 255, 0)
BLUE = (0, 0, 255)
BLACK = (0, 0, 0)

dead_rects = [pygame.Rect([-40, 0, 40, 800]), pygame.Rect([400, 0, 40, 800]),
              pygame.Rect([0, -40, 400, 40]), pygame.Rect([0, 800, 400, 40])]

class Block(object):
    def __init__(self, kind):
        self.kind = kind
        self.configure(kind)
        self.color = RED
        self.dead = False
        self.hard_drop = False

    def configure(self, kind):
        if kind == 'square':
            self.rects = [pygame.Rect([4 * WIDTH / 10, 0, WIDTH / 10, HEIGHT / 20]),
                          pygame.Rect([5 * WIDTH / 10, 0, WIDTH / 10, HEIGHT / 20]),
                          pygame.Rect([4 * WIDTH / 10, 40, WIDTH / 10, HEIGHT / 20]),
                          pygame.Rect([5 * WIDTH / 10, 40, WIDTH / 10, HEIGHT / 20])]

    def drop(self):
        move = True
        for rect in self.rects:
            if rect.move(0, 40).collidelist(dead_rects) != -1:
                move = False
        if move:
            for rect in self.rects:
                rect.move_ip(0, 40)        
        
        else:
            self.dead = True
    def draw(self):
        for rect in self.rects:
            pygame.draw.rect(DISPLAY, self.color, rect)
    def is_dead(self):
        return self.dead
    def move(self, x):
        move = True
        for rect in self.rects:
            if rect.move(x, 0).collidelist(dead_rects) != -1:
                move = False
        if move:
            for rect in self.rects:
                rect.move_ip(x, 0)

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
        #print event
        if event.type == pygame.QUIT:
            running = False
        if event.type == pygame.KEYDOWN:
            print event.key
            if event.key == pygame.K_LEFT:
                block.move(-40)
            if event.key == pygame.K_RIGHT:
                block.move(+40)
            if event.key == 32:
                block.hard_drop = True
    if block.hard_drop:
        for i in range(10):
            block.drop()
    DISPLAY.fill(BLACK)
    block.draw()
    speed += 1
    if speed == 20:
        block.drop()
        speed = 0
    pygame.display.update()
    clock.tick(60)

pygame.quit()
