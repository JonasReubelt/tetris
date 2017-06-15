import pygame
import colors

class PlayField(object):


    def __init__(self, display, width, height, side_length):
        self.display = display
        self.width = width
        self.height = height
        self.side_length = side_length
        self.end_of_field = [pygame.Rect([-self.side_length, 0, self.side_length, self.height]),
                             pygame.Rect([self.width, 0, self.side_length, self.height]),
                             #pygame.Rect([0, -SIDE_LENGTH, WIDTH, SIDE_LENGTH]),
                             pygame.Rect([0, self.height, self.width, self.side_length])]
        self.make_grid()

    def make_grid(self):
        self.grid = []
        for i in range(10):
            for j in range(20):
                self.grid.append(pygame.Rect((i * self.side_length,
                                              j * self.side_length,
                                              self.side_length,
                                              self.side_length)))
    def draw(self):
        self.display.fill(colors.BLACK)
        for g in self.grid:
            pygame.draw.rect(self.display, colors.GRAY, g, 1)
